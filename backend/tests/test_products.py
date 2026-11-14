def test_get_products(client):
    res = client.get("/api/products?limit=5")
    assert res.status_code == 200
    products = res.json()
    assert isinstance(products, list)
    assert len(products) > 0
    p = products[0]
    assert "id" in p
    assert "name" in p
    assert "price" in p
    assert "category" in p

def test_get_categories(client):
    res = client.get("/api/categories")
    assert res.status_code == 200
    categories = res.json()
    assert isinstance(categories, list)
    assert len(categories) > 0
    cat = categories[0]
    assert "id" in cat
    assert "slug" in cat
    assert "productCount" in cat

def test_get_product_by_slug(client):
    # Fetch first product to get its slug
    list_res = client.get("/api/products?limit=1")
    assert list_res.status_code == 200
    p = list_res.json()[0]
    slug = p["slug"]

    res = client.get(f"/api/products/{slug}")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == p["id"]
    assert data["slug"] == slug

