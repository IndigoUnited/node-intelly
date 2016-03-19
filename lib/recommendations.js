'use strict';

var arrIntersection = require('mout').array.intersection;
var pow             = Math.pow;
var sqrt            = Math.sqrt;
var async           = require('async');

function euclideanDistanceScore(a, b, callback) {
    var sharedItems = arrIntersection(Object.keys(a), Object.keys(b));

    if (sharedItems.length <= 0) {
        return callback(null, 0);
    }

    // sum the squares of the differences
    var sumOfSquares = sharedItems.reduce(function (sum, curr) {
        return sum + pow(a[curr] - b[curr], 2);
    }, 0);

    return callback(null, 1 / (1 + sqrt(sumOfSquares)));
}

function pearsonCorrelationScore(a, b, callback) {
    var sharedItems = arrIntersection(Object.keys(a), Object.keys(b));
    var totalShared = sharedItems.length;

    if (totalShared <= 0) {
        return callback(null, 0);
    }

    var sumA    = 0;
    var sumB    = 0;
    var sumASq  = 0;
    var sumBSq  = 0;
    var prodSum = 0;

    sharedItems.forEach(function (curr) {
        // sum scores
        sumA += a[curr];
        sumB += b[curr];

        // sum squares
        sumASq += pow(a[curr], 2);
        sumBSq += pow(b[curr], 2);

        // sum products
        prodSum += a[curr] * b[curr];
    });

    var numerator   = prodSum - (sumA * sumB / totalShared);
    var denominator = sqrt((sumASq - pow(sumA, 2) / totalShared) * (sumBSq - pow(sumB, 2) / totalShared));

    if (denominator === 0) {
        return callback(null, 0);
    }

    return callback(null, numerator / denominator);
}

function top(rankings, target, n, similarityFn, callback) {
    // if n == 0, no limit

    if (!rankings[target]) {
        throw new Error('Target is should be present in rankings');
    }

    var scores         = [];
    var targetRankings = rankings[target];

    // calculate score between target and each of the entities in rankings
    async.forEachOf(rankings, function __calcScores(entityRankings, key, next) {
        // if comparing with target itself, ignore
        if (key === target) {
            return next();
        }

        // calculate similarity score
        return similarityFn(targetRankings, entityRankings, function __handleSimilarity(err, score) {
            if (err) {
                return next(err);
            }

            // add score and respective key
            scores.push({
                key:   key,
                score: score
            });

            return next(null);
        });
    }, function __handleCalcScores(err) {
        if (err) {
            return callback(err);
        }

        // sort scores in descending order
        _sortAndSlice(scores, n, function __compareScores(x, next) {
            return next(null, -1 * x.score); // descending order
        }, function __handleSort(err, scores) {
            if (err) {
                return callback(err);
            }

            // return final result
            return callback(null, scores);
        });
    });
}

function recommendations(rankings, target, n, similarityFn, callback) {
    if (!rankings[target]) {
        throw new Error('Target is should be present in rankings');
    }

    var totals         = {};
    var similaritySums = {};
    var targetRankings = rankings[target];

    // calculate score between target and each of the entities in rankings
    async.forEachOf(rankings, function __calcSimilarityAndScores(entityRankings, entityKey, next) {
        // if comparing with target itself, ignore
        if (entityKey === target) {
            return next();
        }

        // calculate similarity score
        return similarityFn(targetRankings, entityRankings, function __handleSimilarity(err, score) {
            if (err) {
                return next(err);
            }

            // if similarity is 0 or lower, ignore candidate
            if (score <= 0) {
                return next();
            }

            // calculate sum of scores taking into account similarity between entity and target
            async.forEachOf(rankings[entityKey], function __handleEntries(ranking, entryKey, next) {
                // ignore entries already ranked by target
                if (targetRankings.hasOwnProperty(entryKey)) {
                    return next();
                }

                // accumulate ranking * similarity score
                totals[entryKey]         = (totals.hasOwnProperty(entryKey) ? totals[entryKey] : 0) + ranking * score;
                similaritySums[entryKey] = (similaritySums.hasOwnProperty(entryKey) ? similaritySums[entryKey] : 0) + score;

                return next();
            }, next);
        });
    }, function __handleCalcSimilarityAndScores(err) {
        if (err) {
            return callback(err);
        }

        var recommendations = [];

        // normalize rankings with similarity sums into recommendations
        async.forEachOf(totals, function __normalizeRankings(ranking, entryKey, next) {
            recommendations.push({
                key:   entryKey,
                score: ranking / similaritySums[entryKey]
            });

            return next();
        }, function __handleNormalizeRankings(err) {
            if (err) {
                return callback(err);
            }

            // sort recommendations in descending order
            _sortAndSlice(recommendations, n, function __compareScores(x, next) {
                return next(null, -1 * x.score); // descending order
            }, function __handleSort(err, recommendations) {
                if (err) {
                    return callback(err);
                }

                // return final result
                return callback(null, recommendations);
            });
        });
    });
}

// -----------------------------------------------------------------------------

function _sortAndSlice(list, n, compareFn, callback) {
    async.sortBy(list, compareFn, function __handleSort(err, result) {
        if (err) {
            return callback(err);
        }

        // if a limit was provided, slice the result
        if (n > 0) {
            result = result.slice(0, n);
        }

        // return final result
        return callback(null, result);
    });
}

// -----------------------------------------------------------------------------

module.exports = {
    similarity: {
        score: {
            euclideanDistance:  euclideanDistanceScore,
            pearsonCorrelation: pearsonCorrelationScore
        },
        top: top
    },
    suggest: recommendations
};
