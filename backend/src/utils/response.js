'use strict';

function success(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function error(res, message = 'An error occurred', statusCode = 400, errors = null) {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

function paginate(res, data, total, page, limit) {
  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    message: 'Success',
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  });
}

module.exports = { success, error, paginate };
