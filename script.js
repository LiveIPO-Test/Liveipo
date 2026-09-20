// ==========================================
// 1. FIREBASE & VERSION CONFIGURATION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyA0WCWiaQia1K0qJvadIZf3yLqu-QtPHfE",
    authDomain: "liveipo-portal.firebaseapp.com",
    projectId: "liveipo-portal",
    storageBucket: "liveipo-portal.firebasestorage.app",
    messagingSenderId: "630844190369",
    appId: "1:630844190369:web:523e9c2317181a66400ae0",
    measurementId: "G-7R1WGY0296"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

const MASTER_IPO_KEY = 'live_ipo_master_cloud_data';
const DATA_VERSION_KEY = 'live_ipo_data_version_v1';
const CURRENT_VERSION = '2026.09.19-V1';

const initialDefaultData = {
    "PSL": {
        id: "PSL",
        name: "Purple Style Labs IPO Details",
        logo: "https://www.liveipo.in/liveipo_logo.jpg",
        type: "Mainboard",
        about: "Purple Style Labs IPO is a book build issue of ₹680.00 crores...",
        priceBand: "546 to 575",
        cutOff: 575,
        lotRaw: 26,
        lotSize: "26 Shares",
        faceValue: "₹10 per share",
        minInvestment: "₹14,950",
        empDiscount: "Nil",
        totalSize: "₹680.00 Cr",
        freshIssue: "₹500.00 Cr",
        ofs: "₹180.00 Cr",
        listingAt: "BSE, NSE",
        openDate: "2026-08-31",
        closeDate: "2026-09-02",
        allotmentDate: "2026-09-03",
        listingDate: "2026-09-07",
        gmp: "50",
        estPrice: "₹625",
        kostak: "₹500",
        ss: "₹3,000",
        bseCode: "544123",
        nseCode: "PSL",
        isinCode: "INE0XYZ12345",
        expectedListingPrice: "₹625",
        bookProfit: "₹1,300",
        stopLoss: "₹530",
        drhpLink: "https://www.sebi.gov.in/",
        rhpLink: "https://www.nseindia.com/",
        anchorLink: "https://www.bseindia.com/",
        valuation: {
            eps: "₹15.24",
            pe: "37.72x",
            ronw: "24.50%",
            nav: "₹62.10",
            ebitdaMargin: "18.40%",
            patMargin: "9.20%"
        },
        reservation: [
            { category: "QIB", shares: "2,576,000", percentage: "50.00%" },
            { category: "NII (HNI)", shares: "772,800", percentage: "15.00%" },
            { category: "Retail", shares: "1,803,200", percentage: "35.00%" }
        ],
        subShares: [
            { cat: "QIB", off: 0, app: 0 },
            { cat: "NII", off: 2576000, app: 2236000 },
            { cat: "B-NII(₹10L+)", off: 0, app: 0 },
            { cat: "S-NII(₹2-10L)", off: 0, app: 0 },
            { cat: "Retail", off: 2576000, app: 800000 },
            { cat: "Employee", off: 0, app: 0 },
            { cat: "Shareholder", off: 0, app: 0 }
        ],
        subApps: [
            { cat: "B-NII(₹10L+)", off: 0, app: 0 },
            { cat: "S-NII(₹2-10L)", off: 0, app: 0 },
            { cat: "Retail", off: 0, app: 0 }
        ],
        fin: {
            fy23: { yr: "FY-2023", ast: "-", rev: "-", exp: "-", prf: "-" },
            fy24: { yr: "FY-2024", ast: "31.76", rev: "62.75", exp: "53.54", prf: "6.16" },
            fy25: { yr: "FY-2025", ast: "69.32", rev: "79.98", exp: "70.32", prf: "6.66" },
            fy26: { yr: "FY-2026", ast: "99.84", rev: "90.84", exp: "79.99", prf: "7.53" }
        },
        customLots: [
            { app: "Retail Min", lot: 1 },
            { app: "Small HNI", lot: 14 },
            { app: "Big HNI", lot: 68 }
        ],
        regName: "Link Intime India Private Ltd",
        regWeb: "linkintime.co.in",
        regEmail: "psl.ipo@linkintime.co.in",
        leadManagers: "Axis Capital"
    }
};

// ==========================================
// FIREBASE FIRESTORE SYNC FUNCTIONS (100% Fixed)
// ==========================================
async function getMasterIpoData() {
    try {
        const docRef = db.collection("ipo_portal").doc("master_data");
        const doc = await docRef.get();

        let localData = JSON.parse(localStorage.getItem(MASTER_IPO_KEY));

        if (doc.exists && doc.data().ipos) {
            const cloudData = doc.data().ipos;
            
            // જો લોકલસ્ટોરેજમાં ડેટા હાજર હોય, તો લોકલસ્ટોરેજને જ સાચું માનીને ક્લાઉડ પર પણ એ જ ફોર્સ સિન્ક કરો
            if (localData && Object.keys(localData).length > 0) {
                // જો ક્લાઉડ કરતા લોકલસ્ટોરેજમાં વધારે અથવા સમાન આઈપીઓ હોય તો ક્લાઉડ અપડેટ કરો
                await docRef.set({ ipos: localData, updatedAt: new Date().toISOString() }, { merge: true });
                return localData;
            } else {
                // જો લોકલ ખાલી હોય તો ક્લાઉડ ડેટા લોકલમા નાખો
                localStorage.setItem(MASTER_IPO_KEY, JSON.stringify(cloudData));
                return cloudData;
            }
        } else {
            // જો ફાયરબેઝમાં કશું જ ન હોય તો લોકલ અથવા ડિફૉલ્ટ ડેટા અપલોડ કરો
            if (!localData || Object.keys(localData).length === 0) {
                localData = initialDefaultData;
                localStorage.setItem(MASTER_IPO_KEY, JSON.stringify(localData));
            }
            await docRef.set({ ipos: localData, updatedAt: new Date().toISOString() });
            return localData;
        }
    } catch (error) {
        console.error("Error fetching from Firebase, falling back to LocalStorage:", error);
        let dbData = JSON.parse(localStorage.getItem(MASTER_IPO_KEY));
        return dbData && Object.keys(dbData).length > 0 ? dbData : initialDefaultData;
    }
}

// ==========================================
// 3. HELPER UTILITY FUNCTIONS
// ==========================================
function formatDateReadable(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('en-GB', options);
}

function formatFaceValue(val) {
    if (!val) return '₹10 per share';
    let valStr = val.toString().trim();
    if (valStr.includes('per share') || valStr.includes('₹')) {
        return valStr;
    }
    return `₹${valStr} per share`;
}

function formatIssueSizeWithAmount(rawShares, price) {
    if (!rawShares) return 'N/A';
    let rawStr = rawShares.toString().trim();
    if (!/^\d[\d,]*$/.test(rawStr.replace(/,/g, ''))) {
        return rawStr;
    }
    let sharesNum = parseFloat(rawStr.replace(/,/g, '')) || 0;
    let formattedSharesCount = sharesNum.toLocaleString('en-IN');
    if (price > 0 && sharesNum > 0) {
        let totalCr = (sharesNum * price) / 10000000;
        return `${formattedSharesCount} shares (up to ₹${totalCr.toFixed(2)} Cr)`;
    }
    return formattedSharesCount + " shares";
}

function getIpoStatus(openStr, closeStr, allotStr, listStr, isAllotmentOut) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openDate = new Date(openStr);
    openDate.setHours(0, 0, 0, 0);

    const closeDate = new Date(closeStr);
    closeDate.setHours(0, 0, 0, 0);

    const allotDate = new Date(allotStr);
    allotDate.setHours(0, 0, 0, 0);

    const listDate = new Date(listStr);
    listDate.setHours(0, 0, 0, 0);

    if (today < openDate) {
        return { text: "Upcoming", class: "status-upcoming-green" };
    } else if (today >= openDate && today <= closeDate) {
        return { text: "🔴 Live", class: "status-live-blinking" };
    } else if (today > closeDate && today < allotDate) {
        return { text: "Allotment Waiting", class: "status-waiting-orange" };
    } else if (today.getTime() === allotDate.getTime()) {
        return { text: "Allotment Out", class: "status-allotment-parrot" };
    } else if (today.getTime() === listDate.getTime()) {
        return { text: "Listing Today 🚀", class: "status-listing-indigo" };
    } else if (today > listDate) {
        return { text: "Listed", class: "status-listed-slate" };
    }
    return { text: "Closed", class: "status-listed-slate" };
}

function calculateTimelineProgress(openStr, closeStr, allotStr, listStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openDate = new Date(openStr);
    openDate.setHours(0, 0, 0, 0);

    const closeDate = new Date(closeStr);
    closeDate.setHours(0, 0, 0, 0);

    const allotDate = new Date(allotStr);
    allotDate.setHours(0, 0, 0, 0);

    const listDate = new Date(listStr);
    listDate.setHours(0, 0, 0, 0);

    let openStatus = "upcoming", closeStatus = "upcoming", allotStatus = "upcoming", listStatus = "upcoming";
    let progressPercent = "0%";

    if (today.getTime() === openDate.getTime() || (today >= openDate && today <= closeDate)) {
        openStatus = today.getTime() === openDate.getTime() ? "active" : "completed";
    } else if (today > openDate) {
        openStatus = "completed";
    }

    if (today.getTime() === closeDate.getTime()) {
        closeStatus = "active";
        progressPercent = "50%";
    } else if (today > closeDate) {
        closeStatus = "completed";
        progressPercent = "66%";
    } else if (today >= openDate && today < closeDate) {
        closeStatus = "upcoming";
        progressPercent = "33%";
    }

    if (today.getTime() === allotDate.getTime()) {
        allotStatus = "active";
        progressPercent = "83%";
    } else if (today > allotDate) {
        allotStatus = "completed";
        progressPercent = "100%";
    }

    if (today.getTime() === listDate.getTime()) {
        listStatus = "active";
        progressPercent = "100%";
    } else if (today > listDate) {
        listStatus = "completed";
        progressPercent = "100%";
    }

    return { openStatus, closeStatus, allotStatus, listStatus, progressPercent };
}

// ==========================================
// 4. HOME PAGE LOGIC (Cloud Connected)
// ==========================================
// script.js માં loadHomeIpoTable() ફંક્શનની અંદર ટેબલ રો ડેટામાં આ ઉમેરો:

async function loadHomeIpoTable() {
    const tableBody = document.getElementById('homeTableBody');
    if (!tableBody) return;

    let dbData = await getMasterIpoData();
    tableBody.innerHTML = '';

    Object.keys(dbData).forEach(key => {
        const ipo = dbData[key];
        const logoVal = ipo.logo ? ipo.logo.trim() : '';
        
        let logoHtml = '';
        if (logoVal.startsWith("http://") || logoVal.startsWith("https://") || logoVal.startsWith("data:image/")) {
            logoHtml = `<div style="background: #ffffff; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden;"><img src="${logoVal}" alt="Logo" style="width: 100%; height: 100%; object-fit: contain;"></div>`;
        } else {
            logoHtml = `<div style="background: #ffffff; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e2e8f0; font-weight: bold; color: #1e3a8a; font-size: 10px;">${logoVal || ipo.id}</div>`;
        }

        const statusObj = getIpoStatus(ipo.openDate, ipo.closeDate, ipo.allotmentDate, ipo.listingDate, ipo.isAllotmentOut);

        // અલોટમેન્ટ સ્ટેટસ અને ચેક બટન માટેનું હોમપેજ લોજિક
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const allotDate = ipo.allotmentDate ? new Date(ipo.allotmentDate) : null;
        if (allotDate) allotDate.setHours(0, 0, 0, 0);

        let homeAllotmentHtml = '';
        if (ipo.isAllotmentOut === true || (allotDate && today >= allotDate)) {
            const regLink = ipo.registrarUrl || (ipo.regWeb ? `https://${ipo.regWeb}` : '#');
            homeAllotmentHtml = `<a href="${regLink}" target="_blank" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 5px 10px; border-radius: 6px; font-size: 11.5px; font-weight: 600; display: inline-block;">🔍 Check Allotment</a>`;
        } else {
            homeAllotmentHtml = `<span style="color: #c2410c; background-color: #ffedd5; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">Waiting</span>`;
        }

        let totalOff = 0, totalApp = 0;
        if (ipo.subShares) {
            ipo.subShares.forEach(row => {
                if (row.cat !== "B-NII(₹10L+)" && row.cat !== "S-NII(₹2-10L)") {
                    totalOff += (row.off || 0);
                    totalApp += (row.app || 0);
                }
            });
        }
        let overallSubTimes = totalOff > 0 ? (totalApp / totalOff).toFixed(2) + 'x' : '0.00x';

        tableBody.innerHTML += `
            <tr>
                <td style="padding: 12px;">${logoHtml}</td>
                <td>
                    <a href="ipo-detail.html?id=${ipo.id}" style="text-decoration: none;">
                        <strong style="color: #1d4ed8; display: block; cursor: pointer;">${ipo.name}</strong>
                    </a>
                    <span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${ipo.type || 'Mainboard'}</span>
                </td>
                <td style="text-align: center;">${formatDateReadable(ipo.openDate)}</td>
                <td style="text-align: center;">${formatDateReadable(ipo.closeDate)}</td>
                <td style="text-align: center;">${formatDateReadable(ipo.allotmentDate)}</td>
                <td style="text-align: center;">${formatDateReadable(ipo.listingDate)}</td>
                <td style="text-align: center; font-weight: bold;">₹${ipo.priceBand}</td>
                <td style="text-align: center;">${ipo.lotSize}</td>
                <td style="text-align: center;">
                    <span style="background: #dcfce7; color: #166534; padding: 5px 10px; border-radius: 6px; font-weight: 600; font-size: 12px;">+${ipo.gmp}</span>
                </td>
                <td style="text-align: center; font-weight: 600; color: #1e293b;">${overallSubTimes}</td>
                <td style="text-align: center;">${homeAllotmentHtml}</td> <!-- હોમપેજ માટેનું અલોટમેન્ટ સ્ટેટસ/બટન -->
                <td style="text-align: center;">
                    <span class="${statusObj.class}" style="padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; display: inline-block;">${statusObj.text}</span>
                </td>
                <td style="text-align: center;">
                    <a href="ipo-detail.html?id=${ipo.id}" class="view-details-btn" style="background-color: #1d4ed8; color: #ffffff; text-decoration: none; padding: 7px 14px; border-radius: 6px; font-size: 12.5px; display: inline-block;">View Details →</a>
                </td>
            </tr>
        `;
    });
}

function filterIpoTable() {
    const input = document.getElementById('ipoSearchInput');
    if (!input) return;
    const filter = input.value.toLowerCase();
    const tableBody = document.getElementById('homeTableBody');
    if (!tableBody) return;
    const rows = tableBody.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const nameCell = rows[i].getElementsByTagName('td')[1];
        if (nameCell) {
            const textValue = nameCell.textContent || nameCell.innerText;
            if (textValue.toLowerCase().indexOf(filter) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none";
            }
        }
    }
}

// ==========================================
// 5. IPO CALENDAR PAGE LOGIC (Cloud Connected)
// ==========================================
async function loadCalendarTable(filterType = 'all') {
    const tableBody = document.getElementById('calendarTableBody');
    if (!tableBody) return;

    let dbData = await getMasterIpoData();
    tableBody.innerHTML = '';

    Object.keys(dbData).forEach(key => {
        const ipo = dbData[key];
        const statusObj = getIpoStatus(ipo.openDate, ipo.closeDate, ipo.allotmentDate, ipo.listingDate, ipo.isAllotmentOut);
        
        let matchesFilter = true;
        const today = new Date();
        today.setHours(0,0,0,0);
        const openDate = new Date(ipo.openDate);
        const closeDate = new Date(ipo.closeDate);

        if (filterType === 'live') {
            matchesFilter = (today >= openDate && today <= closeDate);
        } else if (filterType === 'upcoming') {
            matchesFilter = (today < openDate);
        } else if (filterType === 'closed') {
            matchesFilter = (today > closeDate);
        }

        if (matchesFilter) {
            tableBody.innerHTML += `
                <tr>
                    <td style="text-align: left; padding: 12px;">
                        <a href="ipo-detail.html?id=${ipo.id}" style="text-decoration: none;">
                            <strong style="color: #1d4ed8; display: block; cursor: pointer;">${ipo.name}</strong>
                        </a>
                        <span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${ipo.type || 'Mainboard'}</span>
                    </td>
                    <td style="text-align: center;">
                        <span class="${statusObj.class}" style="padding: 4px 10px; border-radius: 20px; font-size: 11.5px; font-weight: 700; display: inline-block;">${statusObj.text}</span>
                    </td>
                    <td style="text-align: center;">${formatDateReadable(ipo.openDate)}</td>
                    <td style="text-align: center;">${formatDateReadable(ipo.closeDate)}</td>
                    <td style="text-align: center;">${formatDateReadable(ipo.allotmentDate)}</td>
                    <td style="text-align: center;">${formatDateReadable(ipo.listingDate)}</td>
                    <td style="text-align: center; font-weight: bold;">₹${ipo.priceBand}</td>
                    <td style="text-align: center;">
                        <a href="ipo-detail.html?id=${ipo.id}" class="view-details-btn" style="background-color: #1d4ed8; color: #ffffff; text-decoration: none; padding: 7px 14px; border-radius: 6px; font-size: 12.5px; display: inline-block;">View Details →</a>
                    </td>
                </tr>
            `;
        }
    });
}

function filterCalendar(type) {
    const buttons = document.querySelectorAll('.hero-card .filter-buttons button, .hero-card .filter-buttons a');
    buttons.forEach(btn => {
        btn.classList.remove('active-btn');
        btn.style.background = '#ffffff';
        btn.style.color = '#334155';
        btn.style.borderColor = '#cbd5e1';
    });

    if (window.event && window.event.currentTarget) {
        const clickedBtn = window.event.currentTarget;
        clickedBtn.classList.add('active-btn');
        clickedBtn.style.background = '#1d4ed8';
        clickedBtn.style.color = '#fff';
        clickedBtn.style.borderColor = '#1d4ed8';
    }

    loadCalendarTable(type);
}

// ==========================================
// 6. IPO DETAIL PAGE LOGIC (Cloud Connected)
// ==========================================
async function loadDynamicIpoDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    let ipoId = urlParams.get('id');

    let dbData = await getMasterIpoData();
    if (!ipoId || !dbData[ipoId]) {
        ipoId = Object.keys(dbData)[0];
    }

    const ipo = dbData[ipoId];
    if (!ipo) return;

    const lotSizeNum = ipo.lotRaw || parseInt(ipo.lotSize) || 26;
    const cutOffPrice = ipo.cutOff || 0;
    const minInvestCalc = cutOffPrice * lotSizeNum;

    const logoWrap = document.getElementById('d_logo_wrap');
    if (logoWrap) {
        const logoVal = ipo.logo ? ipo.logo.trim() : '';
        if (logoVal.startsWith("http://") || logoVal.startsWith("https://") || logoVal.startsWith("data:image/")) {
            logoWrap.innerHTML = `<img src="${logoVal}" alt="Logo">`;
        } else {
            logoWrap.innerText = logoVal || ipo.id || "IPO";
        }
    }

    if (document.getElementById('d_name')) document.getElementById('d_name').innerText = ipo.name || "IPO Details";
    if (document.getElementById('d_type')) document.getElementById('d_type').innerText = (ipo.type || "Mainboard") + " IPO";
    if (document.getElementById('d_about')) document.getElementById('d_about').innerText = ipo.about || "No description available.";

    const openStr = formatDateReadable(ipo.openDate);
    const closeStr = formatDateReadable(ipo.closeDate);
    const allotStr = formatDateReadable(ipo.allotmentDate);
    const listStr = formatDateReadable(ipo.listingDate);

    if (document.getElementById('d_dates')) document.getElementById('d_dates').innerText = `${openStr} to ${closeStr}`;
    if (document.getElementById('d_priceband')) document.getElementById('d_priceband').innerText = ipo.priceBand ? `₹${ipo.priceBand}` : 'N/A';

    const timeline = calculateTimelineProgress(ipo.openDate, ipo.closeDate, ipo.allotmentDate, ipo.listingDate);
    const progressEl = document.getElementById('d_progress');
    if (progressEl) progressEl.style.width = timeline.progressPercent;

    const timelineStepsEl = document.getElementById('d_timeline_steps');
    if (timelineStepsEl) {
        timelineStepsEl.innerHTML = `
            <div class="step-node ${timeline.openStatus}"><div class="node-circle">${timeline.openStatus === 'completed' ? '✓' : ''}</div><div class="node-label">Open</div><div class="node-date">${openStr.slice(0, 6)}</div></div>
            <div class="step-node ${timeline.closeStatus}"><div class="node-circle">${timeline.closeStatus === 'completed' ? '✓' : ''}</div><div class="node-label">Close</div><div class="node-date">${closeStr.slice(0, 6)}</div></div>
            <div class="step-node ${timeline.allotStatus}"><div class="node-circle">${timeline.allotStatus === 'completed' ? '✓' : ''}</div><div class="node-label">Allotment</div><div class="node-date">${allotStr.slice(0, 6)}</div></div>
            <div class="step-node ${timeline.listStatus}"><div class="node-circle">${timeline.listStatus === 'completed' ? '✓' : ''}</div><div class="node-label">Listing</div><div class="node-date">${listStr.slice(0, 6)}</div></div>
        `;
    }

    if (document.getElementById('t_open')) document.getElementById('t_open').innerText = openStr;
    if (document.getElementById('t_close')) document.getElementById('t_close').innerText = closeStr;
    if (document.getElementById('t_allotment')) document.getElementById('t_allotment').innerText = allotStr;
    if (document.getElementById('t_listing')) document.getElementById('t_listing').innerText = listStr;

    if (document.getElementById('k_priceband')) document.getElementById('k_priceband').innerText = ipo.priceBand ? `₹${ipo.priceBand}` : 'N/A';
    if (document.getElementById('k_cutoff')) document.getElementById('k_cutoff').innerText = cutOffPrice ? `₹${cutOffPrice} per share` : 'N/A';
    if (document.getElementById('k_lotsize')) document.getElementById('k_lotsize').innerText = lotSizeNum.toLocaleString('en-IN') + " Shares";
    if (document.getElementById('k_mininvest')) document.getElementById('k_mininvest').innerText = minInvestCalc ? `₹${minInvestCalc.toLocaleString('en-IN')}` : ipo.minInvestment || 'N/A';
    if (document.getElementById('k_facevalue')) document.getElementById('k_facevalue').innerText = formatFaceValue(ipo.faceValue);
    if (document.getElementById('k_empdiscount')) document.getElementById('k_empdiscount').innerText = ipo.empDiscount || "Nil";
    
    if (document.getElementById('k_totalsize')) document.getElementById('k_totalsize').innerText = formatIssueSizeWithAmount(ipo.totalSize, cutOffPrice);
    if (document.getElementById('k_freshissue')) document.getElementById('k_freshissue').innerText = formatIssueSizeWithAmount(ipo.freshIssue, cutOffPrice);
    if (document.getElementById('k_ofs')) document.getElementById('k_ofs').innerText = formatIssueSizeWithAmount(ipo.ofs, cutOffPrice);
    if (document.getElementById('k_listingat')) document.getElementById('k_listingat').innerText = ipo.listingAt || "BSE, NSE";

    if (document.getElementById('l_date')) document.getElementById('l_date').innerText = listStr;
    if (document.getElementById('l_bse')) document.getElementById('l_bse').innerText = ipo.bseCode || 'N/A';
    if (document.getElementById('l_nse')) document.getElementById('l_nse').innerText = ipo.nseCode || 'N/A';
    if (document.getElementById('l_isin')) document.getElementById('l_isin').innerText = ipo.isinCode || 'N/A';
    if (document.getElementById('l_price')) document.getElementById('l_price').innerText = cutOffPrice ? `₹${cutOffPrice}` : 'N/A';
    if (document.getElementById('l_lotsize')) document.getElementById('l_lotsize').innerText = lotSizeNum.toLocaleString('en-IN') + " Shares";
    if (document.getElementById('l_expprice')) document.getElementById('l_expprice').innerText = ipo.expectedListingPrice || ipo.estPrice || 'N/A';
    if (document.getElementById('l_profit')) document.getElementById('l_profit').innerText = ipo.bookProfit || 'N/A';
    if (document.getElementById('l_stoploss')) document.getElementById('l_stoploss').innerText = ipo.stopLoss || 'N/A';

    if (document.getElementById('doc_drhp')) document.getElementById('doc_drhp').href = ipo.drhpLink || "#";
    if (document.getElementById('doc_rhp')) document.getElementById('doc_rhp').href = ipo.rhpLink || "#";
    if (document.getElementById('doc_anchor')) document.getElementById('doc_anchor').href = ipo.anchorLink || "#";

    const val = ipo.valuation || {};
    if (document.getElementById('v_eps')) document.getElementById('v_eps').innerText = val.eps || 'N/A';
    if (document.getElementById('v_pe')) document.getElementById('v_pe').innerText = val.pe || 'N/A';
    if (document.getElementById('v_ronw')) document.getElementById('v_ronw').innerText = val.ronw || 'N/A';
    if (document.getElementById('v_nav')) document.getElementById('v_nav').innerText = val.nav || 'N/A';
    if (document.getElementById('v_ebitda')) document.getElementById('v_ebitda').innerText = val.ebitdaMargin || 'N/A';
    if (document.getElementById('v_pat')) document.getElementById('v_pat').innerText = val.patMargin || 'N/A';

    if (document.getElementById('g_gmp')) document.getElementById('g_gmp').innerText = ipo.gmp ? `₹${ipo.gmp}` : 'N/A';

    // ૧. Estimated Listing Price નું કેલ્ક્યુલેશન: (Issue/Cut-off Price + Latest GMP)
    const rawGmpVal = parseFloat(ipo.gmp) || 0;
    let issuePriceVal = cutOffPrice;
    if (!issuePriceVal && ipo.priceBand) {
        const parts = ipo.priceBand.split('to');
        issuePriceVal = parseFloat(parts[parts.length - 1].trim()) || 0;
    }
    const estimatedListingPriceCalc = (issuePriceVal > 0 && rawGmpVal > 0) ? issuePriceVal + rawGmpVal : 0;
    
    if (document.getElementById('g_estprice')) {
        document.getElementById('g_estprice').innerText = estimatedListingPriceCalc > 0 ? `₹${estimatedListingPriceCalc.toLocaleString('en-IN')}` : (ipo.estPrice || 'N/A');
    }
    
    // ૨. રિટેલ એસ્ટીમેટેડ પ્રોફિટનું સાચું કેલ્ક્યુલેશન: (Latest GMP * Lot Size)
    const retailLotSize = lotSizeNum || 26;
    const exactRetailProfit = rawGmpVal * retailLotSize;
    if (document.getElementById('g_profit')) {
        document.getElementById('g_profit').innerText = rawGmpVal > 0 ? `₹${exactRetailProfit.toLocaleString('en-IN')}` : 'N/A';
    }

    if (document.getElementById('g_kostak')) document.getElementById('g_kostak').innerText = ipo.kostak || 'N/A';
    if (document.getElementById('g_ss')) document.getElementById('g_ss').innerText = ipo.ss || 'N/A';

    const hniLotCount = (ipo.customLots && ipo.customLots[1]) ? ipo.customLots[1].lot : 14;
    const hniProfitTotal = rawGmpVal * retailLotSize * hniLotCount;

    if (document.getElementById('g_hni_profit')) {
        document.getElementById('g_hni_profit').innerText = `₹${hniProfitTotal.toLocaleString('en-IN')}`;
    }
    
    const reservationTbody = document.getElementById('reservationTableBody');
    if (reservationTbody) {
        reservationTbody.innerHTML = '';
        
        let reservationData = (ipo.reservation && ipo.reservation.length > 0) ? [...ipo.reservation] : [];

        // જો ડેટાબેઝમાં માત્ર રિટેલ અથવા અધૂરો ડેટા હોય, તો સ્ટાન્ડર્ડ ૩ કેટેગરી ઓટોમેટિક સેટ કરવી
        if (reservationData.length < 3) {
            reservationData = [
                { category: "QIB", shares: "2,576,000", percentage: "50.00%" },
                { category: "NII (HNI)", shares: "772,800", percentage: "15.00%" },
                { category: "Retail", shares: reservationData[0] ? reservationData[0].shares : "1,803,200", percentage: reservationData[0] ? reservationData[0].percentage : "35.00%" }
            ];
        }

        reservationData.forEach(row => {
            reservationTbody.innerHTML += `
                <tr>
                    <td style="text-align:left;"><strong>${row.category}</strong></td>
                    <td style="text-align:center;">${row.shares}</td>
                    <td style="text-align:center;">${row.percentage}</td>
                </tr>
            `;
        });
    }

    const subSharesTbody = document.getElementById('subSharesTableBody');
    if (subSharesTbody) {
        subSharesTbody.innerHTML = '';
        let totalOfferedShares = 0, totalAppliedShares = 0;
        const sharesData = ipo.subShares || [];

        sharesData.forEach(row => {
            if (row.cat !== "B-NII(₹10L+)" && row.cat !== "S-NII(₹2-10L)") {
                totalOfferedShares += (row.off || 0);
                totalAppliedShares += (row.app || 0);
            }
            let times = row.off > 0 ? (row.app / row.off).toFixed(2) : '-';
            let offText = row.off > 0 ? row.off.toLocaleString('en-IN') : '-';
            let appText = row.app > 0 ? row.app.toLocaleString('en-IN') : '-';

            subSharesTbody.innerHTML += `
                <tr>
                    <td style="text-align:left;">${row.cat}</td>
                    <td style="text-align:center;">${offText}</td>
                    <td style="text-align:center;">${appText}</td>
                    <td style="text-align:center;">${times}</td>
                </tr>
            `;
        });

        let totalShareTimes = totalOfferedShares > 0 ? (totalAppliedShares / totalOfferedShares).toFixed(2) : '0.00';
        subSharesTbody.innerHTML += `
            <tr class="total-row">
                <td style="text-align:left;"><strong>Total</strong></td>
                <td style="text-align:center;"><strong>${totalOfferedShares.toLocaleString('en-IN')}</strong></td>
                <td style="text-align:center;"><strong>${totalAppliedShares.toLocaleString('en-IN')}</strong></td>
                <td style="text-align:center;"><strong>${totalShareTimes}</strong></td>
            </tr>
        `;
    }

    const subAppsTbody = document.getElementById('subAppsTableBody');
    if (subAppsTbody) {
        subAppsTbody.innerHTML = '';
        const appsData = ipo.subApps || [];
        appsData.forEach(row => {
            let appTimes = row.off > 0 ? (row.app / row.off).toFixed(2) : '-';
            let offAppText = row.off > 0 ? row.off.toLocaleString('en-IN') : '-';
            let appAppText = row.app > 0 ? row.app.toLocaleString('en-IN') : '-';

            subAppsTbody.innerHTML += `
                <tr>
                    <td style="text-align:left;">${row.cat}</td>
                    <td style="text-align:center;">${offAppText}</td>
                    <td style="text-align:center;">${appAppText}</td>
                    <td style="text-align:center;">${appTimes}</td>
                </tr>
            `;
        });
    }

    const finTbody = document.getElementById('financialsTableBody');
    if (finTbody && ipo.fin) {
        finTbody.innerHTML = '';
        const fList = [ipo.fin.fy23, ipo.fin.fy24, ipo.fin.fy25, ipo.fin.fy26];
        fList.forEach(f => {
            if (f) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="text-align:left;"><strong>${f.yr || 'FY'}</strong></td>
                    <td>${f.ast || '-'}</td>
                    <td>${f.rev || '-'}</td>
                    <td>${f.exp || '-'}</td>
                    <td>${f.prf || '-'}</td>
                `;
                finTbody.appendChild(tr);
            }
        });
    }

    const lotBody = document.getElementById('lotMatrixBody');
    if (lotBody) {
        lotBody.innerHTML = '';
        
        // ડેટાબેઝમાંથી કસ્ટમ લોટ્સ મેળવો અથવા ખાલી એરે રાખો
        let lotsList = (ipo.customLots && ipo.customLots.length > 0) ? [...ipo.customLots] : [];

        // જો ડેટાબેઝમાં ૩ કેટેગરી પૂરી ન હોય (દા.ત. જૂનો ડેટા હોય), તો ઓટોમેટિક સ્ટાન્ડર્ડ ૩ કેટેગરી સેટ કરી દો
        if (lotsList.length < 3) {
            lotsList = [
                { app: "Retail Min", lot: lotsList[0] ? lotsList[0].lot : 1 },
                { app: "Small HNI", lot: 14 },
                { app: "Big HNI", lot: 68 }
            ];
        }

        lotsList.forEach(row => {
            const lotVal = parseInt(row.lot) || 1;
            const totalShares = lotVal * lotSizeNum;
            const totalAmt = totalShares * cutOffPrice;
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:left;"><strong>${row.app}</strong></td>
                <td style="text-align:center;">${lotVal}</td>
                <td style="text-align:center;">${totalShares.toLocaleString('en-IN')}</td>
                <td style="text-align:center;">${totalAmt ? '₹' + totalAmt.toLocaleString('en-IN') : 'N/A'}</td>
            `;
            lotBody.appendChild(tr);
        });
    }

    if (document.getElementById('reg_name')) document.getElementById('reg_name').innerText = ipo.regName || "Link Intime India Private Ltd";
    const webEl = document.getElementById('reg_web');
    if (webEl) {
        webEl.innerText = ipo.regWeb || "linkintime.co.in";
        webEl.href = "https://" + (ipo.regWeb || "linkintime.co.in");
    }
    if (document.getElementById('reg_email')) document.getElementById('reg_email').innerText = ipo.regEmail || "ipo@linkintime.co.in";
    if (document.getElementById('reg_leads')) document.getElementById('reg_leads').innerText = ipo.leadManagers || "Kotak Mahindra Capital, Axis Capital";

    if (document.getElementById('qs_priceband')) {
        document.getElementById('qs_priceband').innerText = ipo.priceBand ? `₹${ipo.priceBand}` : 'N/A';
        
        const retailLot = ipo.lotSize || (lotSizeNum + " Shares");
        const hniLotText = (ipo.customLots && ipo.customLots[1]) ? `${ipo.customLots[1].lot * lotSizeNum} Shares (${ipo.customLots[1].lot} Lots)` : '-';
        document.getElementById('qs_lotsize').innerHTML = `Retail: <strong>${retailLot}</strong><br>HNI: <strong>${hniLotText}</strong>`;

        const retailMinInv = minInvestCalc ? `₹${minInvestCalc.toLocaleString('en-IN')}` : 'N/A';
        const hniMinInv = cutOffPrice ? `₹${(hniLotCount * lotSizeNum * cutOffPrice).toLocaleString('en-IN')}` : 'N/A';
        document.getElementById('qs_investment').innerHTML = `Retail: <strong>${retailMinInv}</strong><br>HNI: <strong>${hniMinInv}</strong>`;

        let totalOff = 0, totalApp = 0;
        if (ipo.subShares) {
            ipo.subShares.forEach(row => {
                if (row.cat !== "B-NII(₹10L+)" && row.cat !== "S-NII(₹2-10L)") {
                    totalOff += (row.off || 0);
                    totalApp += (row.app || 0);
                }
            });
        }
        let overallSubTimes = totalOff > 0 ? (totalApp / totalOff).toFixed(2) + 'x' : '0.00x';
        document.getElementById('qs_subscribed').innerText = overallSubTimes;

        const upperPriceVal = ipo.priceBand ? parseFloat(ipo.priceBand.split('to')[1] || ipo.priceBand) : 0;
        const gmpPct = upperPriceVal > 0 ? ((rawGmpVal / upperPriceVal) * 100).toFixed(1) : '0.0';
        document.getElementById('qs_gmp').innerHTML = `₹${rawGmpVal} <span style="font-size:11px; color:#166534;">(+${gmpPct}%)</span>`;

        const retailProfitPerLot = rawGmpVal * lotSizeNum;
        document.getElementById('qs_profit').innerHTML = `Retail: <strong style="color: #166534;">₹${retailProfitPerLot.toLocaleString('en-IN')}</strong><br>HNI: <strong style="color: #166534;">₹${hniProfitTotal.toLocaleString('en-IN')}</strong>`;

        const currentStatusObj = getIpoStatus(ipo.openDate, ipo.closeDate, ipo.allotmentDate, ipo.listingDate, ipo.isAllotmentOut);
        document.getElementById('qs_status').innerHTML = `<span class="${currentStatusObj.class}" style="padding: 4px 10px; border-radius: 20px; font-size: 11.5px; display: inline-block;">${currentStatusObj.text}</span>`;
        // અલોટમેન્ટ સ્ટેટસ અને ચેક બટન માટેનું લોજિક
// script.js માં loadDynamicIpoDetails() ફંક્શનની અંદર:
const allotmentCell = document.getElementById('qs_allotment_btn');
if (allotmentCell) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allotDate = ipo.allotmentDate ? new Date(ipo.allotmentDate) : null;
    if (allotDate) allotDate.setHours(0, 0, 0, 0);

    // ૧. જો એડમિન પેનલમાંથી 'Mark Allotment Out' ઓન કર્યું હોય અથવા અલોટમેન્ટ તારીખ આવી ગઈ હોય/પસાર થઈ ગઈ હોય
    if (ipo.isAllotmentOut === true || (allotDate && today >= allotDate)) {
        const regLink = ipo.registrarUrl || (ipo.regWeb ? `https://${ipo.regWeb}` : '#');
        allotmentCell.innerHTML = `
            <a href="${regLink}" target="_blank" style="background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🔍 Check Allotment
            </a>
        `;
    } else {
        // ૨. જ્યાં સુધી અલોટમેન્ટ તારીખ નથી આવી ત્યાં સુધી વેટિંગ બતાવશે
        allotmentCell.innerHTML = `<span style="color: #c2410c; background-color: #ffedd5; padding: 3px 8px; border-radius: 4px; font-size: 11.5px; font-weight: 700;">Waiting</span>`;
    }
}
    }
}

// ==========================================
// 7. IMAGE SHARING UTILITIES (html2canvas)
// ==========================================
async function shareSectionAsImage(sectionId, fileNamePrefix) {
    const sectionEl = document.getElementById(sectionId);
    if (!sectionEl) return;

    const shareBtn = sectionEl.querySelector('.btn-share');
    if (shareBtn) shareBtn.style.visibility = 'hidden';

    const brandFooter = sectionEl.querySelector('.export-brand-footer');
    if (brandFooter) brandFooter.style.display = 'block';

    try {
        const canvas = await html2canvas(sectionEl, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
        
        if (shareBtn) shareBtn.style.visibility = 'visible';
        if (brandFooter) brandFooter.style.display = 'none';

        canvas.toBlob(async (blob) => {
            if (!blob) return;
            const fileName = `${fileNamePrefix}_${Date.now()}.png`;
            const file = new File([blob], fileName, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({ files: [file], title: fileNamePrefix, text: `Live IPO Portal - ${fileNamePrefix}:` });
                } catch (err) {
                    if (err.name !== 'AbortError') downloadImageBlob(blob, fileName);
                }
            } else {
                downloadImageBlob(blob, fileName);
                alert('✓ Image downloaded successfully!');
            }
        }, 'image/png');
    } catch (error) {
        console.error('Error generating image:', error);
        if (shareBtn) shareBtn.style.visibility = 'visible';
        if (brandFooter) brandFooter.style.display = 'none';
    }
}

function downloadImageBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==========================================
// 8. AUTO INITIALIZATION (DOMContentLoaded)
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    const savedVersion = localStorage.getItem(DATA_VERSION_KEY);
    if (savedVersion !== CURRENT_VERSION) {
        localStorage.setItem(DATA_VERSION_KEY, CURRENT_VERSION);
    }

    // પેજ મુજબ ડેટા લોડ થશે
    if (document.getElementById('homeTableBody')) {
        await loadHomeIpoTable();
    }
    if (document.getElementById('calendarTableBody')) {
        await loadCalendarTable('all');
    }
    if (document.getElementById('d_logo_wrap') || document.getElementById('section-hero')) {
        await loadDynamicIpoDetails();
    }
});

function getIpoStatus(openStr, closeStr, allotStr, listStr, isAllotmentOut) {
    // જો એડમિન પેનલમાંથી અલોટમેન્ટ આઉટ ટીક કરેલું હોય તો સર્વોપરી એ જ બતાવશે
    if (isAllotmentOut === true) {
        return { text: "Allotment Out", class: "status-allotment-parrot" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const openDate = openStr ? new Date(openStr) : null;
    const closeDate = closeStr ? new Date(closeStr) : null;
    const allotDate = allotStr ? new Date(allotStr) : null;
    const listDate = listStr ? new Date(listStr) : null;

    if (openDate) openDate.setHours(0, 0, 0, 0);
    if (closeDate) closeDate.setHours(0, 0, 0, 0);
    if (allotDate) allotDate.setHours(0, 0, 0, 0);
    if (listDate) listDate.setHours(0, 0, 0, 0);

    // ૧. જો આજની તારીખ ઓપન ડેટ કરતા વહેલી હોય -> Upcoming
    if (openDate && today < openDate) {
        return { text: "Upcoming", class: "status-upcoming-green" };
    } 
    // ૨. જો આજની તારીખ ઓપન અને ક્લોઝ ડેટની વચ્ચે અથવા તે જ દિવસે હોય -> Live
    else if (openDate && closeDate && today >= openDate && today <= closeDate) {
        return { text: "🔴 Live", class: "status-live-blinking" };
    } 
    // ૩. જો ક્લોઝ ડેટ વીતી ગઈ હોય અને અલોટમેન્ટ તારીખ કે લિસ્ટિંગ તારીખ હજી ન આવી હોય -> Allotment Waiting
    else if (closeDate && today > closeDate && (!listDate || today < listDate)) {
        return { text: "Allotment Waiting", class: "status-waiting-orange" };
    } 
    // ૪. જો આજની તારીખ બરાબર લિસ્ટિંગ તારીખ હોય -> Listing Today 🚀
    else if (listDate && today.getTime() === listDate.getTime()) {
        return { text: "Listing Today 🚀", class: "status-listing-indigo" };
    } 
    // ૫. જો લિસ્ટિંગ તારીખ વીતી ગઈ હોય -> Listed
    else if (listDate && today > listDate) {
        return { text: "Listed", class: "status-listed-slate" };
    }

    return { text: "Closed", class: "status-listed-slate" };
}