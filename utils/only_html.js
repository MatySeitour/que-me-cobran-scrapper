export default async function onlyHtml(page) {
    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {
        if (interceptedRequest.isInterceptResolutionHandled()) return;
        if (
            interceptedRequest.url().split("?")[0].endsWith('.mp4') ||
            interceptedRequest.url().split("?")[0].endsWith('.svg') ||
            interceptedRequest.url().split("?")[0].endsWith('.png') ||
            interceptedRequest.url().split("?")[0].endsWith('.jpg')

        )
            interceptedRequest.abort();
        else interceptedRequest.continue();
    });
}