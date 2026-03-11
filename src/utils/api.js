import Papa from 'papaparse';

export async function fetchSheetData(url) {
  try {
    // Convert the Google Sheet URL to a CSV export URL
    let csvUrl = url;
    if (url.includes('/edit')) {
      csvUrl = url.replace(/\/edit.*/, '/export?format=csv&gid=0');
    }

    return new Promise((resolve, reject) => {
      Papa.parse(csvUrl, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          console.error('Error fetching or parsing sheet:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error fetching or parsing sheet:', error);
    return [];
  }
}

export async function fetchNominees() {
  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const filePath = baseUrl.endsWith('/') ? 'nominees.json' : '/nominees.json';
    const res = await fetch(`${baseUrl}${filePath}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error fetching nominees:', error);
    return [];
  }
}

export async function fetchWinners() {
  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const filePath = baseUrl.endsWith('/') ? 'winners.json' : '/winners.json';
    const res = await fetch(`${baseUrl}${filePath}`);
    if (!res.ok) return {};
    const data = await res.json();
    return data;
  } catch (error) {
    // Winners might not exist yet
    return {};
  }
}
