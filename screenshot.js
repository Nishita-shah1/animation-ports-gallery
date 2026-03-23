const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const sites = [
  {
    repo: "shubhammittal588/Galton_box",
    url:  "https://shubhammittal588.github.io/Shubham-Mittal-GSoC/Galton_box/index2.html"
  },
  {
    repo: "Vatsal-Rajput/BrownianMotion",
    url:  "https://vatsal-rajput.github.io/BrownianMotion/"
  },
  {
    repo: "tushar98644/Animint2_Tests",
    url:  "https://tushar98644.github.io/Animint2_Tests/monte-carlo-integration/index.html"
  },
  {
    repo: "busttech/deploy2",
    url:  "https://busttech.github.io/deploy2/"
  },
  {
    repo: "suhaani-agarwal/newton_raphson_method",
    url:  "https://suhaani-agarwal.github.io/r/newton_raphson_method/index.html"
  },
  {
    repo: "Aryan-SINGH-GIT/knn-animint",
    url:  "https://aryan-singh-git.github.io/knn-animint/"
  },
  {
    repo: "AviraL0013/least-squares-animint",
    url:  "https://aviral0013.github.io/least-squares-animint/"
  },
  {
    repo: "prateek-kalwar-95/brownian-motion",
    url:  "https://prateek-kalwar-95.github.io/brownian-motion/"
  },
  {
    repo: "prateek-kalwar-95/flip_coin",
    url:  "https://prateek-kalwar-95.github.io/flip_coin/"
  },
  {
    repo: "ANAMASGARD/conf-int-animint",
    url:  "https://anamasgard.github.io/conf-int-animint/"
  },
  {
    repo: "ANAMASGARD/boot-iid-animint",
    url:  "https://anamasgard.github.io/boot-iid-animint/"
  },
  {
    repo: "ashishtiwari03/animint2-medium-pages",
    url:  "https://ashishtiwari03.github.io/animint2-medium-pages/"
  },
  {
    repo: "ANAMASGARD/cv-ani-animint",
    url:  "https://anamasgard.github.io/cv-ani-animint/"
  },
  {
    repo: "NandaniAggarwal/boot.iid_animation_R",
    url:  "https://nandaniaggarwal.github.io/boot.iid_animation_R/"
  },
  {
    repo: "NandaniAggarwal/boot.lowess_animations_R",
    url:  "https://nandaniaggarwal.github.io/boot.lowess_animations_R/"
  },
  {
    repo: "Nishita-shah1/bisection-animint",
    url:  "https://nishita-shah1.github.io/bisection-animint/"
  },
];

// ── Clean up any old subfolder structure ──────────────────────────────────────
function cleanOldStructure() {
  if (!fs.existsSync('repos')) return;
  const entries = fs.readdirSync('repos', { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subdir = path.join('repos', entry.name);
      const pngs = fs.readdirSync(subdir).filter(f => f.endsWith('.png'));
      for (const png of pngs) {
        const oldPath = path.join(subdir, png);
        const newName = `${entry.name}_${png}`;
        const newPath = path.join('repos', newName);
        fs.renameSync(oldPath, newPath);
        console.log(` Moved: ${oldPath} → ${newPath}`);
      }
      fs.rmdirSync(subdir);
      console.log(` Removed empty folder: ${subdir}`);
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  fs.mkdirSync('repos', { recursive: true });

  console.log('🧹 Cleaning up any old subfolder structure...');
  cleanOldStructure();

  const browser = await puppeteer.launch({ headless: 'new' });
  const page    = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  let success = 0;
  let failed  = [];

  for (const site of sites) {
    // owner_repo.png  — flat, no subfolders
    const filename = site.repo.replace('/', '_') + '.png';
    const filepath = path.join('repos', filename);

    console.log(`\n📸 Capturing: ${site.repo}`);
    console.log(`   URL: ${site.url}`);

    try {
      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 40000 });
      await new Promise(r => setTimeout(r, 2500)); // wait for animint JS to render
      await page.screenshot({
        path: filepath,
        clip: { x: 0, y: 0, width: 1280, height: 720 }
      });
      console.log(`    Saved → ${filepath}`);
      success++;
    } catch (err) {
      console.log(`    Failed: ${err.message}`);
      failed.push(site.repo);
    }
  }

  await browser.close();

  console.log('\n─────────────────────────────────');
  console.log(` Success: ${success}/${sites.length}`);
  if (failed.length > 0) {
    console.log(` Failed (${failed.length}):`);
    failed.forEach(r => console.log(`   - ${r}`));
    console.log('\nFor failed ones, take a manual screenshot and save to repos/ as:');
    failed.forEach(r => console.log(`   repos/${r.replace('/', '_')}.png`));
  }
  console.log('─────────────────────────────────');
})();