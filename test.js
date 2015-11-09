'use strict';

var intelly = require('./index');

var euclideanDistanceScore = intelly.recommendations.similarity.score.euclideanDistance;

euclideanDistanceScore({
    'Major Lazer - Get Free':      5,
    'The Roots - The Fire':        5,
    'Stromae - Formidable':        4.5,
    'Santigold - Disparate Youth': 4,
    'SOMETHING I MADE UP':         3 // note that the 2 sets don't need to
                                     // contain the exact same elements, and any
                                     // exclusive element will be ignored
}, {
    'Major Lazer - Get Free':      3,
    'The Roots - The Fire':        4.3,
    'Stromae - Formidable':        2,
    'Santigold - Disparate Youth': 3
}, function (err, score) {
    console.log(score); // result is 0.22591883983262226
});

// -----------------------------------------------------------------------------

var pearsonCorrelationScore = intelly.recommendations.similarity.score.pearsonCorrelation;

pearsonCorrelationScore({
    'Major Lazer - Get Free':      5,
    'The Roots - The Fire':        5,
    'Stromae - Formidable':        4.5,
    'Santigold - Disparate Youth': 4,
    'SOMETHING I MADE UP':         3 // note that the 2 sets don't need to
                                     // contain the exact same elements, and any
                                     // exclusive element will be ignored
}, {
    'Major Lazer - Get Free':      3.6,
    'The Roots - The Fire':        3.4,
    'Stromae - Formidable':        3,
    'Santigold - Disparate Youth': 2.9
}, function (err, score) {
    console.log(score); // 0.9220108971042157, because the second person tends
                        // to rate songs similarly, but it's a bit more harsh,
                        // which is coped by this algorithm
});

// -----------------------------------------------------------------------------

intelly.recommendations.similarity.top({
    marco: {
        'Major Lazer - Get Free':      5,
        'The Roots - The Fire':        5,
        'Stromae - Formidable':        4.5,
        'Santigold - Disparate Youth': 4,
        'SOMETHING I MADE UP':         3 // note that the sets don't need to
                                         // contain the exact same elements, and any
                                         // exclusive element will be ignored
    },
    diana: {
        'Major Lazer - Get Free':      5,
        'The Roots - The Fire':        5,
        'Stromae - Formidable':        4.5,
        'Santigold - Disparate Youth': 3.9,
    },
    filipe: {
        'Major Lazer - Get Free':      3.5,
        'The Roots - The Fire':        3.7,
        'Stromae - Formidable':        4,
        'Santigold - Disparate Youth': 4,
    },
    andre: {
        'Major Lazer - Get Free':      2.5,
        'The Roots - The Fire':        2.5,
        'Stromae - Formidable':        5,
        'Santigold - Disparate Youth': 3,
    },
    marcelo: {
        'Major Lazer - Get Free':      2,
        'The Roots - The Fire':        2.5,
        'Stromae - Formidable':        2.7,
        'Santigold - Disparate Youth': 3,
    },
    similar_harsher_person: {
        'Major Lazer - Get Free':      3.6,
        'The Roots - The Fire':        3.4,
        'Stromae - Formidable':        3,
        'Santigold - Disparate Youth': 2.9
    }
}, 'marco', 0, pearsonCorrelationScore, function __handleResult(err, res) {
    console.log(res);
    /*  [ { key: 'diana', score: 0.9988907373180359 },
          { key: 'similar_harsher_person', score: 0.9220108971042157 },
          { key: 'andre', score: -0.36563621206356534 },
          { key: 'filipe', score: -0.8528028654224343 },
          { key: 'marcelo', score: -0.8697311348907081 } ] */
});
