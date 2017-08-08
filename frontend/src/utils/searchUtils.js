export const highlightSearchQuery = (string, query) => {
    let result = string;

    query.split(' ').forEach((keyWord) => {
        result = result.replace(new RegExp(keyWord, 'i'), word =>
            (`<span>${word}</span>`));
    });

    return result;
};

