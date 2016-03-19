# Intelly

[work in progress]

## Introduction

```js
var intelly = require('intelly');
```

## 1. Recommendations

### 1.1 Similarity

#### 1.1.1 Score

##### 1.1.1.1 Euclidean Distance Score

Simple method to determine the similarity between two people based on how they ranked common items.

Not fair when data is not normalized (some people tend to be more harsh even though they mean the same, aka *grade inflation*).

Usage: `euclideanDistance(a, b, callback)`

Returns a value between 0 and 1, 0 being very distant, and 1 being exactly the same.

```js
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
```

##### 1.1.1.2 Pearson Correlation Score

Measures how well two sets of data fit on a straight line. The closer the two people are to the straight line, the more similar they are.

Similar to Euclidean Distance Score, but provides better results when ranking is not normalized (some people tend to be more harsh, aka *grade inflation*).

Usage: `pearsonCorrelation(a, b, callback)`

Returns a value between -1 and 1, where 1 is total positive correlation, 0 is no correlation, and −1 is total negative correlation

```js
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
```

#### 1.1.2 Top

Find the top *n* similar people to a specific person.

Usage: `top(rankings, target, n, similarityScoringFunc, callback)`

Note that if `n` is `0`, all people are returned.

```js
// let's find the most similar people to me (Marco)
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
```

#### 1.1.3 Suggestions

Find the top *n* suggestions for a specific person.

Usage: `suggest(rankings, target, n, similarityScoringFunc, callback)`

Note that if `n` is `0`, all items that the `target` person does not know will be returned sorted by suggestion quality in descending order.

```js
intelly.recommendations.suggest({
    marco: {
        'Major Lazer - Get Free':      5,
        'The Roots - The Fire':        5,
        'Stromae - Formidable':        4.5,
        'Santigold - Disparate Youth': 4,
        'Gorillaz - Fell Good Inc':    4,
        'Stromae - Papaoutai':         4.3,
        'SOMETHING I MADE UP':         3 // note that the sets don't need to
                                         // contain the exact same elements, and any
                                         // exclusive element will be ignored
    },
    diana: {
        'Major Lazer - Get Free':      5,
        'The Roots - The Fire':        5,
        'Stromae - Formidable':        4.5,
        'Santigold - Disparate Youth': 3.9,
        'Major Lazer - Lean On':       4.5
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
        'Stromae - Silence':           4.2
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
        'Santigold - Disparate Youth': 2.9,
        'Stromae - Carmen':            4.9
    }
}, 'marco', 0, pearsonCorrelationScore, function __handleResult(err, res) {
    console.log('recommendations', res);
    /*  [ { key: 'Stromae - Carmen', score: 4.9 },
          { key: 'Major Lazer - Lean On', score: 4.5 } ] */
});
```

## TODO

- Implement tests.
- Implement these similarity functions: Jaccard coefficient, Manhattan distance. More info at https://en.wikipedia.org/wiki/Metric_(mathematics)#Examples