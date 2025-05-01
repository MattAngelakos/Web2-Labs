let totalRequests = 0;
export const totalRequestsLog = (req, res, next) => {
    totalRequests=totalRequests+1
    console.log(`Total Requests: ${totalRequests}`)
    next()
};

export const requestBodyLog = (req, res, next) => {
    console.log(`Body: `, req.body)
    console.log(`Verb: ${req.method}`)
    next();
};

const urlRequestCounts = {};
export const urlRequestLog = (req, res, next) => {
    const url = req.originalUrl
    if (urlRequestCounts[url]) {
        urlRequestCounts[url]++
    } else {
        urlRequestCounts[url] = 1
    }
    console.log(`URL: ${url} Request Number: ${urlRequestCounts[url]}`)
    next()
};