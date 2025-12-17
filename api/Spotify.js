const axios = require("axios");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

async function spotifySearchV1(query) {
  try {
    const data = JSON.stringify({
      variables: {
        query,
        limit: 20
      },
      operationName: "findTracks",
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash: "9755dacab35115e202b377eac0c70846b9dfc76a4f6944398e8a79750d40ed4d"
        }
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; 23124RA7EO Build/AQ3A.240829.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.174 Mobile Safari/537.36',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"Android"',
        'authorization': 'Bearer BQB_TTzNZ-yjN7jaCdK1ejZQ0EyL9kZHyii7knS4G7gevLU-8pXaQtSp8CsNovvDT_NlmCIExiOO9Y8vUAx7u_jky2gACxo4REpLs0oeXJo70okS4Htmnr5wz50okR5i0u_8Ck7t2Tk',
        'accept-language': 'id',
        'sec-ch-ua': '"Chromium";v="142", "Android WebView";v="142", "Not_A Brand";v="99"',
        'client-token': 'AABfFBhMgSoTUdeNoG4k8SVPJdrWLNI3CyF/7mN3fmwauq87UpevqDA17Qjp45Mz3Erc39NIw0itGslt6LeXJ42/Nfy13lKuay14Aa75/l59+93SW3gur56oDENOKt/VSFukIATuRYWdYpr+1WnoRbkng/wTVtipVDAt4K0swk/+6miNo5P1sftcv4uTMUm+rfTF4JL6n6Z6NoieNVMqO4EMkONEFxek4dF4rqTFYjs+jpcievDzN+W5XP31m1cAsVC8dhKQISYGV6J9ovo8Sa7+/7bKK0B4C4x3lJlRkOSh8JaXrzEWiEMqHrYy4lz9qbWXxfvSDdZscvGWvtel8rJ6jPnBCQ==',
        'sec-ch-ua-mobile': '?1',
        'content-type': 'application/json;charset=UTF-8',
        'origin': 'https://open.spotify.com',
        'x-requested-with': 'mark.via.gp',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://open.spotify.com/',
        'priority': 'u=1, i'
      },
      body: data
    };

    const res = await fetch('https://api-partner.spotify.com/pathfinder/v2/query', options);
    const text = await res.text();
    const json = JSON.parse(text);

    const items = json.data.searchV2.tracksV2.items;

    return items.map(v => {
      const track = v.item.data;
      return {
        title: track.name,
        link: `https://open.spotify.com/track/${track.id}`
      };
    });

  } catch (e) {
    return { error: e.message };
  }
}

async function spotifyDl(spotifyUrl) {
  try {

    const data = JSON.stringify({
      "spotify_url": spotifyUrl
    });

    const options = {
      method: "POST",
      url: "https://spotmate.online/getTrackData",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; 23124RA7EO Build/AQ3A.240829.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.174 Mobile Safari/537.36',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"Android"',
        'x-csrf-token': 'nTEQFTMUzi8jwGfbQE5DF88IzGJV79t1xNTXg5j9',
        'sec-ch-ua': '"Chromium";v="142", "Android WebView";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        'origin': 'https://spotmate.online',
        'x-requested-with': 'mark.via.gp',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://spotmate.online/en1',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'priority': 'u=1, i',
        'Cookie': 'SITE_TOTAL_ID=aTsiMWTSR4kM0bfbsbg7BwAAlgI; XSRF-TOKEN=eyJpdiI6IjQ0M3B0RE5ZaW52YkRZWlZVcHE1blE9PSIsInZhbHVlIjoiRGJZZjh3ZElsbDlsSkc5d1QxNjBVa2JQSTFPaDhGR0N1aktzOEYydWt5L1haYmpWT056OEhEUVY1MThiYTVrWkU2UUF1SDNVaGRqWHlsQUZ3U09IQ1lQZkl3QWRJdlFBNEtUZUtnNjlUWXNEaC9XZStvaG10QW05dkU3TWFjN3kiLCJtYWMiOiJkODQ4ZGMzYjdlYTZkYWY2ZWUwMmJlOWQ1NGVkM2Y5ZTI3ZmZlMjM2OWM3YWI0YzhjYmQyYjEyNWRhODk5ZDRiIiwidGFnIjoiIn0%3D; spotmateonline_session=eyJpdiI6InlCUzJSWDM5SkF4U2R5cEJub3FIdXc9PSIsInZhbHVlIjoiTk9LR2FrY0VnWi9RN0hseWNJbjJUYzRGbVlWWHE5cyt4YXBaYlV5Z0hLSlZqWUJ2RnNNYjNYb3RKdSt2dElNZXhmbWIwLzBGVDhWdlM0bzAwZHRzQjFvdVFDNmhyV0hlNVVqdHdQOWxZbjI1WjFJSGRHQWhqMmZxenp6RkdObi8iLCJtYWMiOiIyMGZhM2VlMzc3YTQwZGQ4YTlhMGIxNmY1OWQ1ZDQ0MjQzOGFmMWM2MjM0M2JlNjQxZWQ4YzQ5M2RlOWY2MzYyIiwidGFnIjoiIn0%3D'
      },
      data
    };

    const a = await axios.request(options);
    if (!a.data?.id) throw new Error("Track ID tidak ditemukan");

    const data2 = JSON.stringify({
      "urls": "https://open.spotify.com/track/" + a.data.id
    });

    const options2 = {
      method: "POST",
      url: "https://spotmate.online/convert",
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 15; 23124RA7EO Build/AQ3A.240829.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.174 Mobile Safari/537.36',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"Android"',
        'x-csrf-token': 'nTEQFTMUzi8jwGfbQE5DF88IzGJV79t1xNTXg5j9',
        'sec-ch-ua': '"Chromium";v="142", "Android WebView";v="142", "Not_A Brand";v="99"',
        'sec-ch-ua-mobile': '?1',
        'origin': 'https://spotmate.online',
        'x-requested-with': 'mark.via.gp',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://spotmate.online/en1',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'priority': 'u=1, i',
        'Cookie': 'SITE_TOTAL_ID=aTsiMWTSR4kM0bfbsbg7BwAAlgI; XSRF-TOKEN=eyJpdiI6Inh0TCt0VTNOV0EwT1cwektsQ2svZ2c9PSIsInZhbHVlIjoia213RU1UalpsSXJxdytaOUlRTDlTVnErOE01Y0pzRzF2ZWNvSHJUa2J3c2g4bURvRjZPS2MyVlpKaVJBVUhLbWc3RXlxb1BydDEvQWM2SnMxUllEUmxCVXdhQkJ6ZnFFWCtHejhabngvaDFVMmNSaVFkYVZqMVFYVGViaVVJYUYiLCJtYWMiOiJmZDc2YmY3YjZkMzJlZDNiODcxYTNjN2EzYzBiMWM0YjQ2MDFjY2QzMGI1YjBjOThmZDMwODlmODUzOGI4MTQ1IiwidGFnIjoiIn0%3D; spotmateonline_session=eyJpdiI6ImRLNlROb1RZSVlNb0sxUTB1OGwyZWc9PSIsInZhbHVlIjoiZ2NrVlV1MlR2K2podGd0bUJDcG5CaU9acmhzWG5lbW1QTTl0eUJab2ZSUzI5NkJkWGVnZktJTTlSejBaVFZ1a2tWOFJ0eVVOWTlQY1p4UFgvbGozZVpSK09KWWkxOFpYMXhnU2FneUNKRFZkUXB5RitOMlVrRE56MFgyZHJjOFQiLCJtYWMiOiJmNjFkOTEzZjVhN2Y1MGQzMDYwNzljYzVkZjgzNmE0MGE2MGE5Y2NkMTE2MDNjMTAxZTYwNzJhNDM0NjQyM2RkIiwidGFnIjoiIn0%3D'
      },
      data: data2
    };

    const b = await axios.request(options2);
    if (!b.data?.url) throw new Error("Download URL tidak ditemukan");

    return {
      name: a.data?.name || "",
      download_url: b.data.url
    };

  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = [
  {
    name: "Spotify",
    desc: "Spotify MP3 Downloader",
    category: "Downloader",
    path: "/download/spotify?apikey=&url=",
    async run(req, res) {
      const { url, apikey } = req.query;

      if (!apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: "Apikey invalid" });
      }

      if (!url) {
        return res.json({ status: false, error: "Url is required" });
      }

      try {
        const result = await spotifyDl(url);
        res.status(200).json({
          status: true,
          result
        });
      } catch (error) {
        res.status(500).json({
          status: false,
          error: error.message
        });
      }
    },
  },
  {
  name: "Spotify Search",
  desc: "Search tracks from Spotify",
  category: "Search",
  path: "/search/spotify?apikey=&q=",
  async run(req, res) {
    const { apikey, q } = req.query;

    // Apikey invalid
    if (!global.apikey.includes(apikey)) {
      return res.json({ status: false, error: "Apikey invalid" });
    }

    // Query kosong
    if (!q) {
      return res.json({ status: false, error: "Query is required" });
    }

    try {
      const results = await spotifySearchV1(q);
      res.status(200).json({
        status: true,
        result: results
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        error: error.message
      });
    }
  }
}
];