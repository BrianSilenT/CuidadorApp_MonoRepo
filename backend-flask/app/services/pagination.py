def build_paginated_response(paginacion, transform=lambda item: item):
    return {
        "datos": [transform(item) for item in paginacion.items],
        "pagina": paginacion.page,
        "por_pagina": paginacion.per_page,
        "total": paginacion.total,
        "paginas": paginacion.pages
    }
