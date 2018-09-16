function hideElement(element) {
    element.style.display = 'none';
}

function showElement(element, style) {
    var displayStyle = style ? style : 'block';
    element.style.display = displayStyle;
}

function $(tag, options) {
    if (!options) {return document.getElementById(tag);}
    var element = document.createElement(tag);
    for ( var option in options) {
        if (options.hasOwnProperty(option)) {
            element[option] = options[option];
        }
    }
    return element;
}