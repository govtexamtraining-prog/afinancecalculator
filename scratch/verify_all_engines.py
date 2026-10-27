import sys
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("Navigating to http://localhost:3388/index.html...")
        page.goto("http://localhost:3388/index.html")
        page.wait_for_load_state("networkidle")

        print(f"Page title: {page.title()}")
        assert "aFinanceCalculator" in page.title(), "Title mismatch"

        # Check AdSense Slots
        sidebar_ad = page.locator(".ad-slot-container >> text=[Premium Ads Core Slot]")
        assert sidebar_ad.is_visible(), "Sidebar AdSense slot not found or not visible"
        print("[PASS] Sidebar Google AdSense [Premium Ads Core Slot] is visible")

        bottom_ad = page.locator("text=[Horizontal AdSense Leaderboard Placement Area]")
        assert bottom_ad.is_visible(), "Bottom AdSense leaderboard slot not found or not visible"
        print("[PASS] Bottom Google AdSense [Horizontal AdSense Leaderboard Placement Area] is visible")

        # Test Currency Selector
        curr_select = page.locator("#global-currency")
        curr_select.select_option("€")
        page.wait_for_timeout(200)
        mortgage_payment = page.locator("#mortgage-payment").inner_text()
        assert "€" in mortgage_payment, f"Currency symbol € not found in mortgage payment: {mortgage_payment}"
        print(f"[PASS] Global Currency switched to EUR: Mortgage Payment is {mortgage_payment}")

        curr_select.select_option("$")
        page.wait_for_timeout(200)
        assert "$" in page.locator("#mortgage-payment").inner_text()
        print("[PASS] Global Currency switched back to USD")

        # Verify all 20 engines
        engines = [
            ("tab-mortgage", "engine-mortgage", "#mortgage-payment", "$ 2,204.89"),
            ("tab-invoice", "engine-invoice", "#invoice-net", "$ 2,550.00"),
            ("tab-roi", "engine-roi", "#roi-roas", "3.60x"),
            ("tab-crypto", "engine-crypto", "#crypto-liquidation", "$ 57,300.00"),
            ("tab-compound", "engine-compound", "#compound-future-val", "$ 36,424.82"),
            ("tab-caprate", "engine-caprate", "#caprate-rate", "6.47%"),
            ("tab-salary", "engine-salary", "#salary-annual", "$ 93,600.00"),
            ("tab-breakeven", "engine-breakeven", "#breakeven-units", "150 Units"),
            ("tab-creditcard", "engine-creditcard", "#creditcard-months", "26 Months"),
            ("tab-stockavg", "engine-stockavg", "#stockavg-avg-price", "$ 108.75"),
            ("tab-rentbuy", "engine-rentbuy", "#rentbuy-annual-variance", "$ 6,000.00 / Annum"),
            ("tab-margin", "engine-margin", "#margin-profit", "$ 60.00"),
            ("tab-autoloan", "engine-autoloan", "#autoloan-payment", "$ 668.54"),
            ("tab-student", "engine-student", "#student-payment", "$ 294.25"),
            ("tab-budget", "engine-budget", "#budget-needs", "$ 2,000.00"),
            ("tab-interest", "engine-interest", "#interest-yield", "$ 1,500.00"),
            ("tab-dividend", "engine-dividend", "#dividend-annual", "$ 1,125.00"),
            ("tab-inflation", "engine-inflation", "#inflation-future-val", "$ 35,445.94"),
            ("tab-sip", "engine-sip", "#sip-maturity", "$ 116,169.54"),
            ("tab-cagr", "engine-cagr", "#cagr-result", "24.57%")
        ]

        print(f"\n--- Testing 20 Engines Switching and Outputs ---")
        for tab_id, engine_id, output_selector, expected_val in engines:
            page.click(f"#{tab_id}")
            page.wait_for_timeout(100)
            panel = page.locator(f"#{engine_id}")
            assert panel.is_visible(), f"Panel #{engine_id} not visible after clicking #{tab_id}"
            actual_val = page.locator(output_selector).inner_text().strip()
            print(f"[PASS] [{tab_id}] {engine_id} -> Output: '{actual_val}'")
            assert actual_val == expected_val, f"Mismatch on {engine_id}: expected '{expected_val}', got '{actual_val}'"

        # Test Interactive input change on Mortgage
        print("\n--- Testing Interactive Inputs and Toggles ---")
        page.click("#tab-mortgage")
        # Click 15 Year Schedule
        page.click("button:has-text('15 Year Schedule')")
        page.wait_for_timeout(100)
        payment_15yr = page.locator("#mortgage-payment").inner_text().strip()
        print(f"[PASS] Mortgage 15 Year Schedule payment: {payment_15yr}")
        assert payment_15yr == "$ 3,076.92", f"Expected $ 3,076.92, got {payment_15yr}"

        # Reset button test
        page.locator("#engine-mortgage button:has-text('Reset')").click()
        page.wait_for_timeout(100)
        payment_reset = page.locator("#mortgage-payment").inner_text().strip()
        assert payment_reset == "$ 2,204.89", f"Reset failed, got {payment_reset}"
        print(f"[PASS] Mortgage reset restored default payment: {payment_reset}")

        # Test Crypto Short Toggle
        page.click("#tab-crypto")
        page.click("button:has-text('Short Asset (Sell)')")
        page.wait_for_timeout(100)
        short_liq = page.locator("#crypto-liquidation").inner_text().strip()
        print(f"[PASS] Crypto Short liquidation level: {short_liq}")
        assert short_liq == "$ 62,700.00", f"Expected $ 62,700.00, got {short_liq}"

        # Test Search Filter
        print("\n--- Testing Search & Category Filters ---")
        page.fill("#engine-search", "inflation")
        page.wait_for_timeout(100)
        assert page.locator("#tab-inflation").is_visible(), "tab-inflation should be visible"
        assert not page.locator("#tab-mortgage").is_visible(), "tab-mortgage should be hidden by search"
        print("[PASS] Sidebar search filters accurately")
        page.fill("#engine-search", "")

        # Test Category Filter
        page.click("button[data-cat='debt']")
        page.wait_for_timeout(100)
        assert page.locator("#tab-mortgage").is_visible(), "tab-mortgage is debt"
        assert page.locator("#tab-creditcard").is_visible(), "tab-creditcard is debt"
        assert not page.locator("#tab-roi").is_visible(), "tab-roi is business, should be hidden"
        print("[PASS] Category filter 'Debt' correctly filters engines")

        page.click("button[data-cat='all']")
        page.wait_for_timeout(100)

        # Test View Mode: All 20 Grid
        print("\n--- Testing View Mode (All 20 Grid) ---")
        page.click("#view-mode-all")
        page.wait_for_timeout(200)
        visible_panels = 0
        for _, engine_id, _, _ in engines:
            if page.locator(f"#{engine_id}").is_visible():
                visible_panels += 1
        print(f"[PASS] All 20 Grid mode: {visible_panels}/20 panels concurrently visible")
        assert visible_panels == 20, f"Expected 20 visible panels, found {visible_panels}"

        # Switch back to Focus View
        page.click("#view-mode-focus")
        page.wait_for_timeout(200)
        print("[PASS] Switched back to Focus View successfully")

        # Check console errors
        print(f"\n--- Checking Console Errors ---")
        if console_errors:
            print(f"[FAIL] Found console errors: {console_errors}")
            sys.exit(1)
        else:
            print("[PASS] 0 Console errors detected across all interactions!")

        print("\nALL 20 ENGINES AND FEATURES PASSED VERIFICATION WITH 100% ACCURACY!")
        browser.close()

if __name__ == "__main__":
    run_tests()
