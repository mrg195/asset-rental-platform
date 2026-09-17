// 全站交互：详情展开、收藏、分享、海报生成
import html2canvas from 'html2canvas';

const SITE_NAME = 'XX县国有资产招租信息平台';

/* ---------- 收藏（localStorage） ---------- */
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
  catch { return []; }
}

function updateFavoriteButton(assetId) {
  const btn = document.querySelector(`[data-action="favorite"][data-asset-id="${assetId}"]`);
  if (!btn) return;
  const on = getFavorites().includes(assetId);
  btn.textContent = on ? '★ 已收藏' : '☆ 收藏';
  btn.classList.toggle('active', on);
}

function toggleFavorite(assetId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(assetId);
  if (index > -1) {
    favorites.splice(index, 1);
    alert('已取消收藏');
  } else {
    favorites.push(assetId);
    alert('已收藏（仅保存在本机浏览器）');
  }
  localStorage.setItem('favorites', JSON.stringify(favorites));
  updateFavoriteButton(assetId);
}

function refreshFavoriteButtons() {
  document.querySelectorAll('[data-action="favorite"]').forEach(btn => updateFavoriteButton(btn.dataset.assetId));
}

/* ---------- 详情展开 ---------- */
function closeAllDetails(exceptId) {
  document.querySelectorAll('.asset-detail').forEach(d => {
    if (!exceptId || d.id !== exceptId) d.style.display = 'none';
  });
}

function openDetail(id) {
  const detail = document.getElementById('detail-' + id);
  if (!detail) return;
  closeAllDetails(id);
  detail.style.display = 'block';
  detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleDetail(id) {
  const detail = document.getElementById('detail-' + id);
  if (!detail) return;
  if (detail.style.display === 'none') openDetail(id);
  else { detail.style.display = 'none'; }
}

/* ---------- 分享 ---------- */
function shareAsset(detailEl) {
  let url = window.location.href;
  if (detailEl) url = window.location.origin + window.location.pathname + '#' + detailEl.id;
  if (navigator.share) {
    navigator.share({ title: SITE_NAME, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(
      () => alert('链接已复制到剪贴板'),
      () => alert('复制失败，请手动复制地址栏链接')
    );
  }
}

/* ---------- 海报（html2canvas） ---------- */
async function generatePoster(btn) {
  const detail = btn.closest('.asset-detail');
  if (!detail) return;
  const info = detail.querySelector('.detail-info');
  const contact = detail.querySelector('.contact-box');
  const images = Array.from(detail.querySelectorAll('.image-row img'));

  const posterEl = document.createElement('div');
  posterEl.style.cssText = 'position:fixed;left:-99999px;top:0;width:750px;background:#fff;font-family:"PingFang SC","Microsoft YaHei",sans-serif;';
  posterEl.innerHTML = `
    <style>
      .poster{padding:48px 44px;color:#333;}
      .poster h1{text-align:center;color:#1a3a6b;margin:0;font-size:38px;letter-spacing:2px;}
      .poster .sub{text-align:center;color:#8a97ab;margin:10px 0 24px;font-size:20px;}
      .poster hr{border:none;border-top:3px solid #1a3a6b;margin:0 0 28px;}
      .poster .imgs{display:flex;gap:14px;margin-bottom:26px;}
      .poster .imgs img{width:222px;height:160px;object-fit:cover;border-radius:10px;}
      .poster .info h2{margin:0 0 14px;font-size:26px;color:#1a3a6b;}
      .poster .info table{width:100%;border-collapse:collapse;}
      .poster .info td{border:1px solid #d9e2ef;padding:10px 14px;font-size:22px;line-height:1.7;}
      .poster .info td:first-child{width:130px;background:#f2f6fb;color:#666;}
      .poster .contact{background:#f5f7fa;border-radius:12px;padding:20px 24px;margin-top:24px;font-size:22px;line-height:2;}
      .poster .contact h3{margin:0 0 8px;font-size:24px;color:#1a3a6b;}
      .poster .contact p{margin:4px 0;}
      .poster .foot{text-align:center;color:#999;font-size:16px;margin-top:28px;}
    </style>
    <div class="poster">
      <h1>${SITE_NAME}</h1>
      <p class="sub">国有资产招租信息</p>
      <hr />
      ${images.length
        ? `<div class="imgs">${images.map(img =>
            `<img src="${img.currentSrc || img.src}" crossorigin="anonymous" />`).join('')}</div>`
        : ''}
      <div class="info">${info ? info.innerHTML : ''}</div>
      <div class="contact">${contact ? contact.innerHTML : ''}</div>
      <p class="foot">以正式公告为准</p>
    </div>`;
  document.body.appendChild(posterEl);

  const oldText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '生成中…';
  try {
    await Promise.allSettled(
      Array.from(posterEl.querySelectorAll('img')).map(img => (img.decode ? img.decode() : Promise.resolve()))
    );
    const canvas = await html2canvas(posterEl, { useCORS: true, scale: 2, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = '招租信息海报.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (err) {
    alert('海报生成失败：' + (err && err.message ? err.message : String(err)));
  } finally {
    document.body.removeChild(posterEl);
    btn.disabled = false;
    btn.textContent = oldText;
  }
}

/* ---------- 事件委托（挂载于文档级别） ---------- */
document.addEventListener('click', e => {
  const card = e.target.closest('.asset-card');
  if (card) { toggleDetail(card.dataset.id); return; }
  const closeBtn = e.target.closest('.close-btn');
  if (closeBtn) { const d = closeBtn.closest('.asset-detail'); if (d) d.style.display = 'none'; return; }
  const posterBtn = e.target.closest('[data-action="poster"]');
  if (posterBtn) { generatePoster(posterBtn); return; }
  const shareBtn = e.target.closest('[data-action="share"]');
  if (shareBtn) { shareAsset(shareBtn.closest('.asset-detail')); return; }
  const favBtn = e.target.closest('[data-action="favorite"]');
  if (favBtn) { toggleFavorite(favBtn.dataset.assetId); return; }
  if (e.target.closest('[data-action="print"]')) { window.print(); return; }
});

document.addEventListener('DOMContentLoaded', refreshFavoriteButtons);
refreshFavoriteButtons();
