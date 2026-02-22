# 📖 PDF Crawler User Guide

This guide explains everything you need to know to run the **PDF Crawler** successfully.

## 🛠️ Prerequisites (What you need beforehand)

The good news is that because this is a standalone executable (`.exe`), you need very little:

1.  **Windows OS**: The tool is built for Windows (Windows 10 or 11 recommended).
2.  **Internet Connection**: You must be online to crawl websites and download files.
3.  **Target URL**: Have the website address ready (e.g., `https://example.com/reports`).
4.  **No Installation Required**: You do **NOT** need to install Node.js, Python, or any other software.

---

## 🚀 How to Run

1.  Locate **`pdf-crawler.exe`** in the folder.
2.  Double-click it.
3.  A black window will appear asking for a URL.
4.  Paste your URL and press **Enter**.

---

## 📂 Where are my files?
*   The tool will create a folder named **`downloads`** in the same location as the `.exe` file.
*   All downloaded PDFs will be saved there.

## ⚠️ Common Issues & Tips
*   **"Windows protected your PC"**: If you see a blue SmartScreen warning, click **"More info"** -> **"Run anyway"**. This happens because the app is not digitally signed (common for custom internal tools).
*   **Blocked Access**: Some websites block crawlers. If the tool finds 0 files on a page you know has PDFs, the site might have anti-bot protection.

---

## ⚡ Performance
*   **Speed**: The tool downloads up to 5 files simultaneously.
*   **Timeout**: If a file takes longer than 60 seconds to download, it will be skipped to keep the process moving.
