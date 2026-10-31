const formatDate = timestamp =>
new Date(timestamp).toLocaleString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});

export {
    formatDate
};