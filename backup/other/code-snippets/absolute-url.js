function getAbsoluteURL(baseURL, relativeURL) {
    var stack = baseURL.split("/"),
        parts = relativeURL.split("/"),
        i = 0;

    stack.pop();

    for (; i < parts.length; i++) {
        if (parts[i] == ".") {
            continue;
        }
        if (parts[i] == "..") {
            stack.pop();
        } else {
            stack.push(parts[i]);
        }
    }
    return stack.join("/");
}
