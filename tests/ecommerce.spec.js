const { test, expect } = require('@playwright/test');

test.describe('E-Commerce Assignment E2E Tests (Real Requirements)', () => {
  
  test('should load home page and display product grid & categories', async ({ page }) => {
    await page.goto('/');
    
    // Check main title
    await expect(page.locator('h1')).toContainText('catalog');
    
    // Check categories chips are visible
    const categoryChips = page.locator('.category-filter-btn');
    await expect(categoryChips.first()).toBeVisible();
    expect(await categoryChips.count()).toBeGreaterThan(0);
    
    // Wait for loading to finish
    await expect(page.locator('#loading-indicator')).not.toBeVisible();
    
    // Check product cards are visible in grid
    const productsGrid = page.locator('#products-grid');
    await expect(productsGrid).toBeVisible();
    const productCards = page.locator('.product-card');
    expect(await productCards.count()).toBeGreaterThan(0);
  });

  test('should filter products when a category chip is clicked and update URL', async ({ page }) => {
    await page.goto('/');
    
    // Get the second category button (first is "All Products")
    const categoryBtns = page.locator('.category-filter-btn');
    const secondCatBtn = categoryBtns.nth(1);
    const catId = await secondCatBtn.getAttribute('data-category-id');
    
    // Click category filter
    await secondCatBtn.click();
    
    // Verify URL contains categories parameter
    expect(page.url()).toContain(`categories=${catId}`);
    
    // Wait for loading to finish
    await expect(page.locator('#loading-indicator')).not.toBeVisible();
    const filteredCount = await page.locator('.product-card').count();
    
    // Category filter should return products
    expect(filteredCount).toBeGreaterThan(0);
  });

  test('should navigate to product detail page and show details (fetching dynamically by ID)', async ({ page }) => {
    await page.goto('/');
    
    // Select the first product card
    const firstProduct = page.locator('.product-card').first();
    const titleText = await firstProduct.locator('div > div').first().textContent();
    const priceText = await firstProduct.locator('span').first().textContent();
    const productCardId = await firstProduct.getAttribute('data-product-id');
    
    // Setup listener for dynamic fetch by ID
    const responsePromise = page.waitForResponse(response => 
      response.url().includes(`/api/v1/products/${productCardId}`) && response.status() === 200
    );
    
    // Click card to navigate
    await firstProduct.click();
    
    // Wait for the dynamic API fetch by ID to resolve
    await responsePromise;
    
    // Verify route matches dynamic pattern
    await expect(page).toHaveURL(/\/product\/\d+\/details/);
    
    // Verify details are rendered
    await expect(page.locator('#product-title')).toContainText(titleText.trim());
    await expect(page.locator('#product-price')).toContainText(priceText.trim());
    await expect(page.locator('#product-desc')).toBeVisible();
    await expect(page.locator('#add-to-cart-btn')).toBeVisible();
    
    // Verify back button works
    const backBtn = page.locator('#back-to-home');
    await backBtn.click();
    await expect(page).toHaveURL('/');
  });

  test('should add items to cart and show correct values in footer, with localStorage persistence', async ({ page }) => {
    await page.goto('/');
    
    // Verify footer starts at 0
    await expect(page.locator('#cart-total-items')).toContainText('0 items');
    await expect(page.locator('#cart-total-value')).toContainText('Total Value: $0.00');
    
    // Click first product card
    await page.locator('.product-card').first().click();
    
    // Get product details
    const priceRaw = await page.locator('#product-price').textContent();
    const priceVal = parseFloat(priceRaw.replace('$', ''));
    
    // Click "Add to My Cart" twice
    const addToCartBtn = page.locator('#add-to-cart-btn');
    await addToCartBtn.click();
    await addToCartBtn.click();
    
    // Verify footer updates
    await expect(page.locator('#cart-total-items')).toContainText('2 items');
    const expectedValue = (priceVal * 2).toFixed(2);
    await expect(page.locator('#cart-total-value')).toContainText(`Total Value: $${expectedValue}`);
    
    // Verify localStorage has the cart data
    const localStorageCart = await page.evaluate(() => localStorage.getItem('cart'));
    expect(localStorageCart).not.toBeNull();
    const parsedCart = JSON.parse(localStorageCart);
    expect(parsedCart.length).toBe(1);
    expect(parsedCart[0].quantity).toBe(2);

    // Refresh page and check persistence
    await page.reload();
    await expect(page.locator('#cart-total-items')).toContainText('2 items');
    await expect(page.locator('#cart-total-value')).toContainText(`Total Value: $${expectedValue}`);
    
    // Click nav cart button to slide open the side cart drawer
    await page.locator('#nav-cart-btn').click();
    await expect(page.locator('#cart-sidebar')).toBeVisible();

    // Verify item row is rendered in side drawer
    const itemRow = page.locator('.sidebar-cart-item').first();
    await expect(itemRow).toBeVisible();

    // Click plus button in side drawer to increment quantity
    await itemRow.locator('.qty-plus-btn').click();
    await expect(page.locator('#cart-total-items')).toContainText('3 items');

    // Click minus button in side drawer to decrement quantity
    await itemRow.locator('.qty-minus-btn').click();
    await expect(page.locator('#cart-total-items')).toContainText('2 items');

    // Click delete button in side drawer to remove item completely
    await itemRow.locator('.delete-item-btn').click();
    await expect(page.locator('#cart-total-items')).toContainText('0 items');
    await expect(page.locator('#cart-total-value')).toContainText('Total Value: $0.00');
  });

  test('should persist filters on refresh, back navigation, and in URL', async ({ page }) => {
    await page.goto('/');
    
    // Verify no query parameters initially
    expect(page.url()).not.toContain('?');
    
    // Click the second category filter button
    const categoryBtns = page.locator('.category-filter-btn');
    const secondCatBtn = categoryBtns.nth(1);
    const catId = await secondCatBtn.getAttribute('data-category-id');
    await secondCatBtn.click();
    
    // Verify URL contains categories param
    expect(page.url()).toContain(`categories=${catId}`);
    
    // Refresh the page
    await page.reload();
    
    // Verify URL still contains categories param
    expect(page.url()).toContain(`categories=${catId}`);
    
    // Verify that the second category chip is still selected (has bg-blue-500 styling)
    const selectedChip = page.locator(`.category-filter-btn[data-category-id="${catId}"]`);
    await expect(selectedChip).toHaveCSS('background-color', 'rgb(59, 130, 246)');

    // Navigate to details page
    await page.locator('.product-card').first().click();
    await expect(page).toHaveURL(/\/product\/\d+\/details/);

    // Go back
    await page.goBack();
    
    // Verify URL still contains categories param after back navigation
    expect(page.url()).toContain(`categories=${catId}`);
  });
});
