module.exports = function (content) {
    console.log('loader-2 normal');
    return `${content}console.log('added in loader-2');`;
}

module.exports.pitch = function (remainingRequest, precedingRequest, data) {
    console.log('loader-2 pitch');
    return '';
};