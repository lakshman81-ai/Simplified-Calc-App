from playwright.sync_api import sync_playwright

def verify_section_creator(page):
    page.goto("http://localhost:5173/")

    # Wait for the "Extended Calc" tab to be available and click it
    page.wait_for_selector('button:has-text("Extended Calc")')
    page.click('button:has-text("Extended Calc")')

    # Wait for the "Pipe Rack Calc" tool to be available and click it
    page.wait_for_selector('div:has-text("Pipe Rack Calc")')
    page.click('div:has-text("Pipe Rack Calc")')

    # Wait for the "DESIGN PIPE RACK SECTION" button and click it to open the Section Creator
    page.wait_for_selector('button:has-text("DESIGN PIPE RACK SECTION")')
    page.click('button:has-text("DESIGN PIPE RACK SECTION")')

    # Wait for the Section Creator overlay to appear
    page.wait_for_selector('text=Advanced Pipe Rack Section Creator')

    # Wait a bit for the canvas to render
    page.wait_for_timeout(2000)

    # Take a screenshot
    page.screenshot(path="/home/jules/verification/section_creator.png")

    print("Screenshot saved to /home/jules/verification/section_creator.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_section_creator(page)
        finally:
            browser.close()
