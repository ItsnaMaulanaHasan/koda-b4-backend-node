export function buildHateoasPagination(req, page, limit, totalData) {
  const totalPages = Math.ceil(totalData / limit) || 1;
  const protocol = req.protocol;

  const host = req.get("host");

  const basePath = req.baseUrl + req.path;

  const makeURL = (pageNum) => {
    const queryParams = new URLSearchParams();

    for (const [key, value] of Object.entries(req.query)) {
      if (key !== "page" && key !== "limit") {
        if (Array.isArray(value)) {
          value.forEach((v) => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    }

    queryParams.set("page", pageNum.toString());
    queryParams.set("limit", limit.toString());

    return `${protocol}://${host}${basePath}?${queryParams.toString()}`;
  };

  const links = {
    self: makeURL(page),
    first: makeURL(1),
    last: makeURL(totalPages),
  };

  if (page > 1) {
    links.prev = makeURL(page - 1);
  } else {
    links.prev = null;
  }

  if (page < totalPages) {
    links.next = makeURL(page + 1);
  } else {
    links.next = null;
  }

  return links;
}
