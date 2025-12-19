import requests
from bs4 import BeautifulSoup
import json
import os
import time
from dotenv import load_dotenv

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException, TimeoutException

load_dotenv()

BASE_URL = os.getenv("FRONTEND_ORIGIN")
AGENTS_API_URL = os.getenv("AGENTS_API_URL")
SCRAPER_USERNAME = os.getenv("SCRAPER_USERNAME")
SCRAPER_PASSWORD = os.getenv("SCRAPER_PASSWORD")
STATIC_PAGES_TO_SCRAPE = [
    "/",
    "/articles",
    "/discussions_list_page",
]
OUTPUT_FILE = "knowledge_base.json"
# --------------------

def setup_driver():
    print("Setting up headless Chrome driver...")
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("window-size=1920x1080")
    
    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    print("Driver setup complete.")
    return driver

def perform_login(driver):
    if not SCRAPER_USERNAME or not SCRAPER_PASSWORD:
        print("Warning: Scraper username/password not set. Scraping as a guest.")
        return False

    login_url = f"{BASE_URL}/login"
    print(f"Attempting to log in at {login_url}...")
    try:
        driver.get(login_url)
        wait = WebDriverWait(driver, 10)
        
        email_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        password_field = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']")))
        login_button = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))

        email_field.send_keys(SCRAPER_USERNAME)
        password_field.send_keys(SCRAPER_PASSWORD)
        
        # Используем JS-клик, чтобы обойти возможные перекрытия (например, cookie баннер)
        driver.execute_script("arguments[0].click();", login_button)

        wait.until(EC.url_changes(login_url))
        print("Login successful.")
        return True
    except TimeoutException:
        print("Error: Login failed. Could not find login elements or navigation did not happen after click.")
        return False
    except Exception as e:
        print(f"An unexpected error occurred during login: {e}")
        return False


def get_agent_pages(driver):
    if not AGENTS_API_URL:
        print("Warning: AGENTS_API_URL is not set. Skipping dynamic agent page scraping.")
        return []

    try:
        access_token = driver.execute_script("return localStorage.getItem('access_token')")
    except WebDriverException:
        access_token = None

    if not access_token:
        print("Warning: Could not get access token from localStorage after login. API calls might fail.")
        return []
        
    headers = {"Authorization": f"Bearer {access_token}"}
    print("Using Authorization token from browser session for API request.")

    agent_urls = []
    try:
        print(f"Fetching agent list from {AGENTS_API_URL}...")
        response = requests.get(AGENTS_API_URL, headers=headers, timeout=15)
        response.raise_for_status()
        agents = response.json()
        
        for agent in agents:
            if 'id' in agent:
                agent_urls.append(f"/agent/{agent['id']}")
        
        print(f"Discovered {len(agent_urls)} agent pages.")
        return agent_urls
    except Exception as e:
        print(f"Could not fetch agent list: {e}")
        return []

def scrape_page(driver, url):
    print(f"Scraping {url} with Selenium...")
    try:
        driver.get(url)
        time.sleep(5)
        
        html = driver.page_source
        soup = BeautifulSoup(html, 'html.parser')
        
        content_element = soup.find('main') or soup.find('body')

        if content_element:
            for tag in content_element(['script', 'style', 'nav', 'footer', 'header', 'button']):
                tag.decompose()
            text = ' '.join(content_element.get_text(separator=' ', strip=True).split())
            
            if "token not found" in text.lower():
                print(f"Authentication error detected on page {url}. Content might be incomplete.")
            
            return text
        
        print(f"Warning: Could not find <body> or <main> tag on {url}.")
        return None

    except Exception as e:
        print(f"An unexpected error occurred while scraping {url}: {e}")
        return None

def main():
    driver = setup_driver()
    
    try:
        perform_login(driver)
        
        agent_pages = get_agent_pages(driver)
        all_pages_to_scrape = STATIC_PAGES_TO_SCRAPE + agent_pages
        
        knowledge_base = []
        
        for page_path in all_pages_to_scrape:
            url = BASE_URL + page_path
            content = scrape_page(driver, url)
            
            if content:
                knowledge_base.append({
                    "url": url,
                    "content": content
                })
                print(f"Successfully scraped and processed {url}")
            else:
                print(f"Failed to scrape {url}")
                
        if not knowledge_base:
            print("No content was scraped. The knowledge base is empty.")
            return

        print(f"\nScraping finished. Total pages scraped: {len(knowledge_base)}")
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(knowledge_base, f, ensure_ascii=False, indent=4)
        print(f"Knowledge base successfully saved to {OUTPUT_FILE}")

    finally:
        print("Closing the driver.")
        driver.quit()


if __name__ == "__main__":
    main()
