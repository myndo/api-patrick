export interface ClientApiMethods {
    [key: string]: {
        endpoint: string;
        method: string;
    };
}

export type IntegrationApiCall = {
    action: string;
    body?: Object;
    urlParams?: Object;
    queryParams?: Object;
};

export const getURLEndpoint = (options: {
    endpoint: string;
    urlParams: Object;
    queryParams: Object;
}) => {
    const { endpoint, urlParams, queryParams } = options;

    //replace params in url
    let url = endpoint;
    if (urlParams) {
        Object.keys(urlParams).forEach((key: string) => {
            url = url.replace(`:${key}`, urlParams[key]);
        });
    }

    //add query params
    if (queryParams) {
        url += '?';
        Object.keys(queryParams).forEach((key: string) => {
            if (queryParams[key]) {
                Object.keys(urlParams).forEach((key: string) => {
                    url += `${key}=${queryParams[key]}`;
                });
            }
        });
        url = url.slice(0, -1);
    }

    return url;
};
