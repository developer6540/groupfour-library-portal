import logger from "@/lib/logger";

export function successResponse<T>(data: T, message = "Request successful", statusCode = 200) {
    logger.info(message, statusCode);
    return {
        status: "success",
        statusCode,
        message,
        data,
    };
}

export function errorResponse(message = "Something went wrong", statusCode = 500) {
    logger.error(message, statusCode);
    return {
        status: "error",
        statusCode,
        message,
        data: null
    };
}