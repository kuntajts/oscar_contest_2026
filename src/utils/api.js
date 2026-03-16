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
          const transformed = results.data.map((row) => {
            const newRow = {};
            for (const key in row) {
              const cleanedKey = key.trim();
              if (cleanedKey === 'Timestamp' || cleanedKey === 'Full Name') {
                newRow[cleanedKey] = row[key];
              } else {
                // Extract ID from [#ID] Name or use the key directly if it's numeric
                const match = cleanedKey.match(/\[#(\d+)\]/);
                const id = match ? match[1] : cleanedKey;
                newRow[id] = row[key];
              }
            }
            return newRow;
          });
          resolve(transformed);
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
