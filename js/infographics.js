/**
 * InfoViz — lightweight SVG infographic engine for aFinanceCalculator.
 * Visual-first results. Does not change calculator math in mechanics.js.
 */
(function (global) {
  'use strict';

  var COLORS = {
    cyan: '#22d3ee',
    cyanSoft: '#67e8f9',
    green: '#34d399',
    rose: '#fb7185',
    amber: '#fbbf24',
    slate: '#3f3f46',
    muted: '#71717a'
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function moneyShort(n) {
    var v = Number(n) || 0;
    var abs = Math.abs(v);
    if (abs >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (abs >= 1e3) return (v / 1e3).toFixed(abs >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return String(Math.round(v));
  }

  function polar(cx, cy, r, angleDeg) {
    var a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function arcPath(cx, cy, r, startAngle, endAngle) {
    if (endAngle - startAngle >= 359.9) endAngle = startAngle + 359.9;
    var start = polar(cx, cy, r, endAngle);
    var end = polar(cx, cy, r, startAngle);
    var large = endAngle - startAngle > 180 ? 1 : 0;
    return 'M ' + start.x + ' ' + start.y + ' A ' + r + ' ' + r + ' 0 ' + large + ' 0 ' + end.x + ' ' + end.y;
  }

  function donutSvg(segments, opts) {
    opts = opts || {};
    var size = opts.size || 180;
    var cx = size / 2;
    var cy = size / 2;
    var r = opts.radius || 68;
    var stroke = opts.stroke || 18;
    var total = segments.reduce(function (s, seg) { return s + Math.max(0, seg.value || 0); }, 0);
    if (total <= 0) {
      return '<svg viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + COLORS.slate + '" stroke-width="' + stroke + '"/>' +
        '</svg>';
    }
    var angle = 0;
    var paths = segments.map(function (seg) {
      var portion = (Math.max(0, seg.value) / total) * 360;
      if (portion <= 0.01) return '';
      var start = angle;
      var end = angle + portion;
      angle = end;
      return '<path class="infographic-ring-anim" d="' + arcPath(cx, cy, r, start, end) +
        '" fill="none" stroke="' + esc(seg.color || COLORS.cyan) +
        '" stroke-width="' + stroke + '" stroke-linecap="butt"/>';
    }).join('');
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + esc(opts.label || 'Breakdown chart') + '">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + COLORS.slate + '" stroke-width="' + stroke + '" opacity="0.45"/>' +
      paths + '</svg>';
  }

  function gaugeSvg(pct, opts) {
    opts = opts || {};
    var size = 180;
    var cx = 90;
    var cy = 100;
    var r = 70;
    var clamped = Math.max(0, Math.min(100, pct || 0));
    var start = -120;
    var end = 120;
    var valueEnd = start + ((end - start) * clamped) / 100;
    return '<svg viewBox="0 0 ' + size + ' 130" role="img" aria-label="' + esc(opts.label || 'Gauge') + '">' +
      '<path d="' + arcPath(cx, cy, r, start, end) + '" fill="none" stroke="' + COLORS.slate + '" stroke-width="14" stroke-linecap="round"/>' +
      '<path class="infographic-ring-anim" d="' + arcPath(cx, cy, r, start, valueEnd) + '" fill="none" stroke="' + esc(opts.color || COLORS.cyan) + '" stroke-width="14" stroke-linecap="round"/>' +
      '</svg>';
  }

  function barsSvg(items, opts) {
    opts = opts || {};
    var width = 560;
    var labelW = 128;
    var valueW = 96;
    var barMax = width - labelW - valueW - 16;
    var rowH = 36;
    var height = Math.max(72, items.length * rowH + 12);
    var max = Math.max.apply(null, items.map(function (i) { return i.value || 0; }).concat([1]));
    var rows = items.map(function (item, idx) {
      var y = 10 + idx * rowH;
      var w = Math.max(6, ((item.value || 0) / max) * barMax);
      return '<text x="0" y="' + (y + 16) + '" fill="#a1a1aa" font-size="12" font-family="Plus Jakarta Sans,sans-serif">' + esc(item.label) + '</text>' +
        '<rect x="' + labelW + '" y="' + y + '" width="' + barMax + '" height="18" rx="9" fill="' + COLORS.slate + '" opacity="0.45"/>' +
        '<rect class="infographic-bar-anim" x="' + labelW + '" y="' + y + '" width="' + w.toFixed(1) + '" height="18" rx="9" fill="' + esc(item.color || COLORS.cyan) + '"/>' +
        '<text x="' + width + '" y="' + (y + 16) + '" text-anchor="end" fill="#ffffff" font-size="12" font-weight="700" font-family="Plus Jakarta Sans,sans-serif">' + esc(item.display || moneyShort(item.value)) + '</text>';
    }).join('');
    return '<svg viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(opts.label || 'Comparison') + '">' + rows + '</svg>';
  }

  function legendHtml(segments) {
    return segments.map(function (seg) {
      return '<div class="infographic-legend-row">' +
        '<span class="infographic-swatch" style="background:' + esc(seg.color) + ';color:' + esc(seg.color) + '"></span>' +
        '<span class="infographic-metric-label">' + esc(seg.label) + '</span>' +
        '<span class="infographic-metric-value">' + esc(seg.display || moneyShort(seg.value)) + '</span>' +
        (seg.sub ? '<span class="infographic-metric-sub">' + esc(seg.sub) + '</span>' : '') +
        '</div>';
    }).join('');
  }

  function mount(id) {
    return document.getElementById(id);
  }

  function setVisual(hostId, html, centerHtml) {
    var host = mount(hostId);
    if (!host) return;
    host.innerHTML = '<div class="infographic-visual">' + html +
      (centerHtml ? '<div class="infographic-center-label">' + centerHtml + '</div>' : '') +
      '</div>';
  }

  function setLegend(hostId, html) {
    var host = mount(hostId);
    if (!host) return;
    host.innerHTML = html;
  }

  var InfoViz = {
    colors: COLORS,

    mortgage: function (data) {
      var principal = Math.max(0, data.principal || 0);
      var interest = Math.max(0, data.interest || 0);
      var payment = data.payment || 0;
      var ltv = data.ltv || 0;
      var total = principal + interest;
      var pPct = total > 0 ? (principal / total) * 100 : 0;
      var iPct = total > 0 ? (interest / total) * 100 : 0;
      var segs = [
        { label: 'Goes to your home', value: principal, color: COLORS.green, display: data.principalLabel || moneyShort(principal), sub: pPct.toFixed(0) + '% of total cost' },
        { label: 'Paid as interest', value: interest, color: COLORS.rose, display: data.interestLabel || moneyShort(interest), sub: iPct.toFixed(0) + '% of total cost' },
        { label: 'Loan-to-value', value: ltv, color: COLORS.cyan, display: ltv.toFixed(0) + '%', sub: 'Borrow vs home price' }
      ];
      setVisual(
        'infographic-mortgage',
        donutSvg(segs.slice(0, 2), { label: 'Principal vs interest over the loan', size: 200, radius: 74, stroke: 20 }),
        '<strong>' + esc(data.paymentLabel || moneyShort(payment)) + '</strong><span>per month</span>'
      );
      setLegend('infographic-mortgage-legend', legendHtml(segs));
    },

    paycheck: function (data) {
      var net = Math.max(0, data.net || 0);
      var taxes = Math.max(0, data.taxes || 0);
      var gross = net + taxes;
      var nPct = gross > 0 ? (net / gross) * 100 : 0;
      var tPct = gross > 0 ? (taxes / gross) * 100 : 0;
      var segs = [
        { label: 'Take-home pay', value: net, color: COLORS.green, display: data.netLabel || moneyShort(net), sub: nPct.toFixed(0) + '% of gross' },
        { label: 'Taxes & FICA', value: taxes, color: COLORS.rose, display: data.taxesLabel || moneyShort(taxes), sub: tPct.toFixed(0) + '% of gross' }
      ];
      setVisual(
        'infographic-paycheck',
        donutSvg(segs, { label: 'Paycheck split', size: 200, radius: 74, stroke: 20 }),
        '<strong>' + esc(data.netLabel || moneyShort(net)) + '</strong><span>in your pocket</span>'
      );
      setLegend('infographic-paycheck-legend', legendHtml(segs));
    },

    compound: function (data) {
      var principal = Math.max(0, data.principal || 0);
      var growth = Math.max(0, data.growth || 0);
      var future = principal + growth;
      var gPct = future > 0 ? (growth / future) * 100 : 0;
      var segs = [
        { label: 'Your deposit', value: principal, color: COLORS.cyan, display: data.principalLabel || moneyShort(principal), sub: 'What you put in' },
        { label: 'Growth earned', value: growth, color: COLORS.green, display: data.growthLabel || moneyShort(growth), sub: gPct.toFixed(0) + '% of future value' }
      ];
      setVisual(
        'infographic-compound',
        donutSvg(segs, { label: 'Compound growth mix', size: 200, radius: 74, stroke: 20 }),
        '<strong>' + esc((data.multiplier || 0).toFixed(1) + 'x') + '</strong><span>multiplier</span>'
      );
      setLegend('infographic-compound-legend', legendHtml(segs));
    },

    fire: function (data) {
      var savings = Math.max(0, data.savings || 0);
      var target = Math.max(0, data.target || 0);
      var pct = target > 0 ? Math.min(100, (savings / target) * 100) : 0;
      var years = data.years;
      setVisual(
        'infographic-fire',
        gaugeSvg(pct, { label: 'Progress to FIRE number', color: COLORS.cyan }),
        '<strong>' + esc(pct.toFixed(0) + '%') + '</strong><span>' +
          esc(years == null ? 'to target' : (years + ' yr path')) + '</span>'
      );
      setLegend(
        'infographic-fire-legend',
        legendHtml([
          { label: 'Saved now', value: savings, color: COLORS.cyan, display: data.savingsLabel || moneyShort(savings), sub: pct.toFixed(0) + '% of target' },
          { label: 'FIRE number', value: target, color: COLORS.green, display: data.targetLabel || moneyShort(target), sub: years == null ? 'Beyond 60 years' : years + ' years to go' }
        ])
      );
    },

    snowball: function (data) {
      var items = [
        { label: 'Snowball interest', value: data.snowballInterest || 0, color: COLORS.rose, display: data.snowballLabel || moneyShort(data.snowballInterest || 0) },
        { label: 'Avalanche interest', value: data.avalancheInterest || 0, color: COLORS.green, display: data.avalancheLabel || moneyShort(data.avalancheInterest || 0) }
      ];
      var host = mount('infographic-snowball');
      if (host) {
        host.innerHTML = '<div class="infographic-visual infographic-visual--wide">' + barsSvg(items, { label: 'Debt payoff methods' }) + '</div>';
      }
      setLegend(
        'infographic-snowball-legend',
        legendHtml([
          { label: 'You save with avalanche', value: data.savings || 0, color: COLORS.amber, display: data.savingsLabel || moneyShort(data.savings || 0), sub: 'Interest avoided vs snowball' }
        ])
      );
    },

    autoloan: function (data) {
      var principal = Math.max(0, data.principal || 0);
      var interest = Math.max(0, data.interest || 0);
      var total = principal + interest;
      var iPct = total > 0 ? (interest / total) * 100 : 0;
      var segs = [
        { label: 'Car financed', value: principal, color: COLORS.cyan, display: data.principalLabel || moneyShort(principal), sub: 'Loan amount' },
        { label: 'Finance charge', value: interest, color: COLORS.rose, display: data.interestLabel || moneyShort(interest), sub: iPct.toFixed(0) + '% of total paid' }
      ];
      setVisual(
        'infographic-autoloan',
        donutSvg(segs, { label: 'Auto loan cost mix', size: 200, radius: 74, stroke: 20 }),
        '<strong>' + esc(data.paymentLabel || moneyShort(data.payment || 0)) + '</strong><span>car payment</span>'
      );
      setLegend('infographic-autoloan-legend', legendHtml(segs));
    },

    refreshActive: function () {
      try {
        if (typeof calcMortgage === 'function') calcMortgage();
        if (typeof calcPaycheck === 'function') calcPaycheck();
        if (typeof calcCompound === 'function') calcCompound();
        if (typeof calcFire === 'function') calcFire();
        if (typeof calcSnowball === 'function') calcSnowball();
        if (typeof calcAutoLoan === 'function') calcAutoLoan();
      } catch (e) { /* engines may not be ready */ }
    }
  };

  global.InfoViz = InfoViz;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(InfoViz.refreshActive, 50);
    });
  } else {
    setTimeout(InfoViz.refreshActive, 50);
  }
})(window);
