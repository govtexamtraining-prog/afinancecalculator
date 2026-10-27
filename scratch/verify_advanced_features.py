import sys
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_advanced_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(str(err)))

        print("Navigating to http://localhost:3388/index.html...")
        page.goto("http://localhost:3388/index.html")
        page.wait_for_load_state("networkidle")

        # 1. Test Theme Toggle (Dark/Light)
        print("\n--- 1. Testing Dark / Light Theme Toggle ---")
        html_el = page.locator("html")
        assert "dark" in html_el.get_attribute("class"), "Initial theme should be dark"
        print("[PASS] Initial theme is dark")

        page.click("#theme-toggle-btn")
        page.wait_for_timeout(200)
        assert "light" in html_el.get_attribute("class"), "Theme should switch to light"
        print("[PASS] Successfully toggled to Light mode")

        page.click("#theme-toggle-btn")
        page.wait_for_timeout(200)
        assert "dark" in html_el.get_attribute("class"), "Theme should switch back to dark"
        print("[PASS] Successfully toggled back to Dark mode")

        # 2. Test SVG Micro-Charts
        print("\n--- 2. Testing SVG Micro-Charts & Breakdown Bars ---")
        page.click("#tab-mortgage")
        page.wait_for_timeout(150)
        
        pr_bar = page.locator("#mortgage-chart-principal")
        int_bar = page.locator("#mortgage-chart-interest")
        assert pr_bar.is_visible() and int_bar.is_visible(), "Mortgage breakdown bar missing"
        pr_width = pr_bar.evaluate("el => el.style.width")
        int_width = int_bar.evaluate("el => el.style.width")
        print(f"[PASS] Mortgage breakdown chart widths: Principal={pr_width}, Interest={int_width}")

        # Compound Growth SVG
        page.click("#tab-compound")
        page.wait_for_timeout(150)
        comp_svg_paths = page.locator("#compound-growth-svg path").count()
        assert comp_svg_paths >= 2, f"Expected at least 2 SVG paths in compound chart, got {comp_svg_paths}"
        print(f"[PASS] Compound interest SVG growth curve rendered with {comp_svg_paths} paths")

        # SIP Growth SVG
        page.click("#tab-sip")
        page.wait_for_timeout(150)
        sip_svg_paths = page.locator("#sip-growth-svg path").count()
        assert sip_svg_paths >= 2, f"Expected at least 2 SVG paths in SIP chart, got {sip_svg_paths}"
        print(f"[PASS] SIP planner SVG growth curve rendered with {sip_svg_paths} paths")

        # Inflation Milestones
        page.click("#tab-inflation")
        page.wait_for_timeout(150)
        m5 = page.locator("#inflation-m5").inner_text()
        m10 = page.locator("#inflation-m10").inner_text()
        assert "$" in m5 and "$" in m10, f"Inflation milestones missing: m5={m5}, m10={m10}"
        print(f"[PASS] Inflation milestones rendered: 5yr={m5}, 10yr={m10}")

        # Crypto Gauge
        page.click("#tab-crypto")
        page.wait_for_timeout(150)
        gauge_width = page.locator("#crypto-gauge-bar").evaluate("el => el.style.width")
        print(f"[PASS] Crypto liquidation gauge bar rendered: width={gauge_width}")

        # 3. Test What-If Comparison & Extra Payment Simulator
        print("\n--- 3. Testing What-If Sensitivity & Extra Payments ---")
        page.click("#tab-mortgage")
        page.wait_for_timeout(150)
        savings_15yr = page.locator("#mortgage-15yr-savings").inner_text()
        assert "$" in savings_15yr, f"15-yr savings delta not calculated: {savings_15yr}"
        print(f"[PASS] 15-Year term interest savings delta: {savings_15yr}")

        # Test Extra payment simulator
        page.click("button:has-text('+250')")
        page.wait_for_timeout(200)
        months_saved = page.locator("#mortgage-extra-months-saved").inner_text()
        int_saved = page.locator("#mortgage-extra-int-saved").inner_text()
        assert "Mo" in months_saved and months_saved != "0 Months", f"Extra payment didn't calculate months saved: {months_saved}"
        print(f"[PASS] Extra $250/mo Simulator: Shaves {months_saved}, Saves {int_saved} in interest")

        # 4. Test Expandable Amortization Schedule & CSV Export
        print("\n--- 4. Testing Amortization Schedule Drawer & CSV Export ---")
        page.click("button:has-text('📑 Schedule & CSV')")
        page.wait_for_timeout(200)
        modal = page.locator("#amortization-modal")
        assert modal.is_visible() and "active" in modal.get_attribute("class"), "Amortization modal failed to open"
        
        table_rows = page.locator("#amortization-tbody tr").count()
        assert table_rows > 0, f"Expected amortization table rows, got {table_rows}"
        print(f"[PASS] Amortization Schedule Modal opened with {table_rows} annual summary rows")

        # Switch to Monthly Details
        page.click("#amort-view-monthly")
        page.wait_for_timeout(200)
        monthly_rows = page.locator("#amortization-tbody tr").count()
        assert monthly_rows >= 360, f"Expected 360 monthly rows, got {monthly_rows}"
        print(f"[PASS] Switched to Monthly Details view: {monthly_rows} rows loaded")

        # Trigger CSV download
        with page.expect_download() as download_info:
            page.click("button:has-text('📥 Download CSV')")
        download = download_info.value
        csv_filename = download.suggested_filename
        assert csv_filename.endswith(".csv"), f"Invalid CSV filename: {csv_filename}"
        print(f"[PASS] CSV file download generated successfully: '{csv_filename}'")

        # Close modal with Escape
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
        assert "active" not in modal.get_attribute("class"), "Modal failed to close on Escape"
        print("[PASS] Modal closed successfully via Escape key")

        # 5. Test Calculation History Drawer
        print("\n--- 5. Testing Calculation History Drawer ---")
        page.click("button:has-text('Copy Breakdown')")
        page.wait_for_timeout(200)

        page.click("button:has-text('History')")
        page.wait_for_timeout(200)
        drawer = page.locator("#history-drawer")
        assert drawer.is_visible() and "active" in drawer.get_attribute("class"), "History drawer failed to open"
        history_items = page.locator("#history-list > div").count()
        assert history_items > 0, "No items in history list after copying breakdown"
        print(f"[PASS] History Drawer opened with {history_items} recorded calculation(s)")

        page.click("#history-drawer button:has-text('✕')")
        page.wait_for_timeout(200)
        assert "active" not in drawer.get_attribute("class"), "History drawer failed to close"
        print("[PASS] History drawer closed successfully")

        # 6. Test Keyboard Shortcuts
        print("\n--- 6. Testing Keyboard Shortcuts (Ctrl+K / '/') ---")
        page.keyboard.press("/")
        page.wait_for_timeout(100)
        search_focused = page.evaluate("() => document.activeElement.id === 'engine-search'")
        assert search_focused, "Search input was not focused on '/' keypress"
        print("[PASS] Quick search shortcut '/' successfully focused the search field")

        # 7. Check Console Errors
        print("\n--- 7. Checking Console Errors ---")
        if console_errors:
            print(f"[FAIL] Found console errors: {console_errors}")
            sys.exit(1)
        else:
            print("[PASS] 0 Console errors detected across all advanced interactions!")

        print("\nALL ADVANCED FEATURES TESTED & VERIFIED WITH 100% SUCCESS!")
        browser.close()

if __name__ == "__main__":
    run_advanced_tests()
