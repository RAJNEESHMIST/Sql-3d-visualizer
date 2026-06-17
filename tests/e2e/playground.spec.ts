import { test, expect } from '@playwright/test';

test.describe('SQLVision 3D E2E Test Suite', () => {

  test('should load landing page and navigate around', async ({ page }) => {
    // Go to landing page
    await page.goto('/');
    
    // Check main title
    const title = page.locator('h1');
    await expect(title).toContainText('VISUALIZE SQL QUERIES');
    
    // Verify navigation links exist
    const playgroundLink = page.locator('header nav >> text=Playground');
    const learnLink = page.locator('header nav >> text=Learn');
    const challengeLink = page.locator('header nav >> text=Challenges');
    
    await expect(playgroundLink).toBeVisible();
    await expect(learnLink).toBeVisible();
    await expect(challengeLink).toBeVisible();
  });

  test('should compile and play queries in the playground', async ({ page }) => {
    // Go to Playground
    await page.goto('/playground');
    
    // Verify SQL editor has default query loaded
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    await expect(textarea).toContainText('SELECT e.name');
    
    // Click visualize query
    const visualizeBtn = page.locator('button:has-text("Visualize Query")');
    await visualizeBtn.click();
    
    // Expect timeline controls to materialize
    const stepLabel = page.locator('text=STEP:');
    await expect(stepLabel).toBeVisible();
    
    // Click play button
    const playBtn = page.locator('button:has-text("PLAY")');
    await expect(playBtn).toBeVisible();
  });

  test('should load lessons and solve quizzes', async ({ page }) => {
    // Go to Learn
    await page.goto('/learn');
    
    // Verify first lesson detail heading
    const lessonTitle = page.locator('h2');
    await expect(lessonTitle).toBeVisible();
    
    // Expect challenge questions to load
    const challengeTitle = page.locator('text=Predictive Challenge Question');
    await expect(challengeTitle).toBeVisible();
    
    // Click option A
    const option = page.locator('button:has-text("A")');
    if (await option.isVisible()) {
      await option.click();
      const submitBtn = page.locator('button:has-text("Submit Prediction")');
      await expect(submitBtn).toBeEnabled();
    }
  });

  test('should load challenge arena', async ({ page }) => {
    // Go to Challenge Mode
    await page.goto('/challenge');
    
    const rankTitle = page.locator('text=Current Rank');
    await expect(rankTitle).toBeVisible();
    
    const verifyBtn = page.locator('button:has-text("Run & Verify Solution")');
    await expect(verifyBtn).toBeVisible();
  });

});
