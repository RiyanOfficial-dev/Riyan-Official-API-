const axios = require('axios');
const qs = require('qs');
const cheerio = require('cheerio');

// ============================
//      FUNCTION XNXX-DL
// ============================
async function xnxxDl(url) {
  let data = qs.stringify({
    url,
    csrfmiddlewaretoken: 'HDkGxcRWF7sp7QxE8CAALfwXmLkmjJiKLml3hYuraPrpFUutZWuOqY7JO7mMKGER'
  });

  let config = {
    method: 'POST',
    url: 'https://www.tubeninja.net/get',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 15; 23124RA7EO Build/AQ3A.240829.003) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.7444.174 Mobile Safari/537.36',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': 'https://www.tubeninja.net',
      'Referer': 'https://www.tubeninja.net/',
      'Cookie': 'csrftoken=BbDfitVqFxkhtNIjeokPgRR78LdIMEFqFUEC2fyVafjh1RF85Ie3VAsTA7f8dB1x'
    },
    data
  };

  try {
    const res = await axios.request(config);
    const html = res.data;

    // Load HTML ke cheerio
    const $ = cheerio.load(html);

    // Cari <a download href="https://cdn77...">
    const cdnLinks = [];
    $('a[download]').each((i, el) => {
      const link = $(el).attr('href');
      if (link && link.includes('cdn77')) {
        cdnLinks.push(link);
      }
    });

    return {
      high: cdnLinks[0] || null,
      low: cdnLinks[1] || null,
      total_found: cdnLinks.length
    };

  } catch (err) {
    return { error: err.message };
  }
}



// ============================
//      FUNCTION XNXX SEARCH
// ============================
async function xnxxSearch(query) {
  const config = {
    method: 'GET',
    url: `https://www.xnxx.com/search/${encodeURIComponent(query)}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 15)',
      'Accept': 'text/html,application/xhtml+xml',
      'Referer': 'https://www.google.com/'
    }
  };

  const response = await axios.request(config);
  const $ = cheerio.load(response.data);

  let hasil = [];

  $(".thumb-block").each((i, el) => {
    const block = $(el);

    const a = block.find(".thumb-under p a");
    const title = a.attr("title") || a.text().trim();
    const href = a.attr("href");
    const link = href ? "https://www.xnxx.com" + href : null;

    // views
    let views = block.find(".metadata .right").first().text().trim();
    views = views.replace(/(\d+%)/, "").trim();

    // duration
    let durationMatch = block.find(".metadata").text().match(/(\d+min)/);
    const duration = durationMatch ? durationMatch[1] : null;

    // quality
    let quality = block.find(".video-hd").text().trim() || null;

    if (title && link) {
      hasil.push({
        title,
        link,
        duration,
        views,
        quality
      });
    }
  });

  return hasil;
}



// ============================
//      ENDPOINT EXPRESS
// ============================
module.exports = [
  {
    name: "XNXX",
    desc: "Download video xnxx 18+",
    category: "Downloader",
    path: "/download/xnxx?apikey=&url=",
    async run(req, res) {
      const { apikey, url } = req.query;

      if (!apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: "Apikey invalid" });
      }

      if (!url) {
        return res.json({ status: false, error: "Url is required" });
      }

      try {
        const result = await xnxxDl(url);
        return res.status(200).json({ status: true, result });

      } catch (error) {
        return res.status(500).json({ status: false, error: error.message });
      }
    }
  },

  {
    name: "XNXX Search",
    desc: "Search video xnxx 18+",
    category: "Search",
    path: "/search/xnxx?apikey=&query=",
    async run(req, res) {
      const { apikey, query } = req.query;

      if (!apikey || !global.apikey.includes(apikey)) {
        return res.json({ status: false, error: "Apikey invalid" });
      }

      if (!query) {
        return res.json({ status: false, error: "Query is required" });
      }

      try {
        const result = await xnxxSearch(query);
        return res.status(200).json({ status: true, result });

      } catch (err) {
        return res.status(500).json({ status: false, error: err.message });
      }
    }
  }
];