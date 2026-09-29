// ==========================================
// ADMIN PANEL SCRIPT (JSONBin.io Cloud Synced)
// ==========================================

const ADMIN_BIN_ID = "6aaf80f9ac6210605ae1bce6";
const ADMIN_API_KEY = "$2a$10$Pl5b/ekYZXhRBmQVY6DwieMC10GztytHM9d7CnR0zqmje7BWYj6yC";

document.addEventListener('DOMContentLoaded', async () => {
    // ૧. પેજ લોડ થતાં જ ક્લાઉડ અને લોકલમાંથી ડેશબોર્ડ ડેટા લોડ કરો
    await loadAdminDashboard();
    loadRegistrarDropdown();

    // ૨. IPO ના નામ પરથી ઓટોમેટિક શોર્ટ કોડ (Unique ID) બનાવવા માટે
    const nameInput = document.getElementById('adm_name');
    const idInput = document.getElementById('adm_id');

    if (nameInput && idInput) {
        nameInput.addEventListener('input', function() {
            const val = nameInput.value.trim();
            if (val.length > 0) {
                const words = val.replace(/ipo/gi, '').trim().split(/\s+/);
                let initials = '';
                for (let i = 0; i < Math.min(words.length, 3); i++) {
                    if (words[i].length > 0) {
                        initials += words[i][0].toUpperCase();
                    }
                }
                if (!initials) initials = 'IPO';
                const randomNum = Math.floor(100 + Math.random() * 900);
                idInput.value = initials + randomNum;
            }
        });
    }

    // ૩. IPO Type બદલાય ત્યારે એક્સચેન્જ ઓટોમેટિક સેટ કરવા માટે
    const typeSelect = document.getElementById('adm_type');
    const cbBse = document.getElementById('ex_bse');
    const cbNse = document.getElementById('ex_nse');

    if (typeSelect && cbBse && cbNse) {
        typeSelect.addEventListener('change', function() {
            if (this.value === 'Mainboard') {
                cbBse.checked = true;
                cbNse.checked = true;
            } else if (this.value === 'SME') {
                cbBse.checked = true;
                cbNse.checked = false;
            }
        });
    }

    // ૪. Price Band End માં વેલ્યુ નાખતા જ કટ-ઓફ પ્રાઇઝમાં ઓટોમેટિક આવી જાય
    const priceEndInput = document.getElementById('adm_priceEnd');
    const cutOffInput = document.getElementById('adm_cutOff');

    if (priceEndInput && cutOffInput) {
        priceEndInput.addEventListener('input', function() {
            cutOffInput.value = priceEndInput.value;
        });
    }

    // ૫. Form Submit Handler (ક્લાઉડ સેવ સાથે)
    const manageForm = document.getElementById('manageIpoForm');
    if (manageForm) {
        manageForm.addEventListener('submit', async function(e) {
            e.preventDefault(); // Page reload અટકાવવા માટે

            const ipoIdInput = document.getElementById('adm_id');
            if (!ipoIdInput) return;
            const ipoId = ipoIdInput.value.trim().toUpperCase();

            let dbData = await fetchAdminDataFromCloud();
            let existingIpo = dbData[ipoId] || {};

            const pStart = document.getElementById('adm_priceStart').value.trim();
            const pEnd = document.getElementById('adm_priceEnd').value.trim();
            const combinedPriceBand = (pStart && pEnd) ? `${pStart} to ${pEnd}` : (pStart || pEnd || '');

            let exchanges = [];
            const exBse = document.getElementById('ex_bse');
            const exNse = document.getElementById('ex_nse');
            if (exBse && exBse.checked) exchanges.push('BSE');
            if (exNse && exNse.checked) exchanges.push('NSE');
            const listingAtVal = exchanges.length > 0 ? exchanges.join(', ') : 'BSE, NSE';

            const ipoData = {
                id: ipoId,
                name: document.getElementById('adm_name').value,
                logo: document.getElementById('adm_logo').value || existingIpo.logo || ipoId,
                type: document.getElementById('adm_type').value,
                about: document.getElementById('adm_about').value,
                priceBand: combinedPriceBand,
                cutOff: parseFloat(document.getElementById('adm_cutOff').value) || 0,
                lotRaw: parseInt(document.getElementById('adm_lotRaw').value) || 26,
                lotSize: (document.getElementById('adm_lotRaw').value || 26) + " Shares",
                faceValue: document.getElementById('adm_faceValue').value || "₹10 per share",
                empDiscount: document.getElementById('adm_empDiscount').value || "Nil",
                totalSize: document.getElementById('adm_totalSize').value || "N/A",
                freshIssue: document.getElementById('adm_freshissue').value || "N/A",
                ofs: document.getElementById('adm_ofs').value || "N/A",
                listingAt: listingAtVal,
                openDate: document.getElementById('adm_openDate').value,
                closeDate: document.getElementById('adm_closeDate').value,
                allotmentDate: document.getElementById('adm_allotmentDate').value,
                listingDate: document.getElementById('adm_listingDate').value,
                gmp: document.getElementById('adm_gmp').value,
                estPrice: document.getElementById('adm_estPrice').value,
                bookProfit: document.getElementById('adm_bookProfit').value,
                
                isAllotmentOut: document.getElementById('adm_isAllotmentOut').checked,
                registrarUrl: document.getElementById('adm_allotmentLink').value || document.getElementById('adm_registrarSelect').value || '',
                
                valuation: existingIpo.valuation || { eps: "₹15.00", pe: "35.00x", ronw: "20.00%", nav: "₹50.00", ebitdaMargin: "15.00%", patMargin: "8.00%" },
                reservation: existingIpo.reservation || [{ category: "Retail", shares: "35%", percentage: "35.00%" }],
                
                // સબસ્ક્રિપ્શન શેર ડેટા સેવ કરવા માટે
                subShares: [
                    { cat: "QIB", off: parseInt(document.getElementById('sub_qib_off')?.value) || 0, app: parseInt(document.getElementById('sub_qib_app')?.value) || 0 },
                    { cat: "NII", off: parseInt(document.getElementById('sub_nii_off')?.value) || 0, app: parseInt(document.getElementById('sub_nii_app')?.value) || 0 },
                    { cat: "B-NII(₹10L+)", off: parseInt(document.getElementById('sub_bnii_off')?.value) || 0, app: parseInt(document.getElementById('sub_bnii_app')?.value) || 0 },
                    { cat: "S-NII(₹2-10L)", off: parseInt(document.getElementById('sub_snii_off')?.value) || 0, app: parseInt(document.getElementById('sub_snii_app')?.value) || 0 },
                    { cat: "Retail", off: parseInt(document.getElementById('sub_retail_off')?.value) || 0, app: parseInt(document.getElementById('sub_retail_app')?.value) || 0 },
                    { cat: "Employee", off: parseInt(document.getElementById('sub_emp_off')?.value) || 0, app: parseInt(document.getElementById('sub_emp_app')?.value) || 0 },
                    { cat: "Shareholder", off: parseInt(document.getElementById('sub_sh_off')?.value) || 0, app: parseInt(document.getElementById('sub_sh_app')?.value) || 0 }
                ],

                // એપ્લિકેશન બ્રેકઅપ ડેટા સેવ કરવા માટે
                subApps: [
                    { cat: "B-NII(₹10L+)", off: parseInt(document.getElementById('app_bnii_off')?.value) || 0, app: parseInt(document.getElementById('app_bnii_app')?.value) || 0 },
                    { cat: "S-NII(₹2-10L)", off: parseInt(document.getElementById('app_snii_off')?.value) || 0, app: parseInt(document.getElementById('app_snii_app')?.value) || 0 },
                    { cat: "Retail", off: parseInt(document.getElementById('app_retail_off')?.value) || 0, app: parseInt(document.getElementById('app_retail_app')?.value) || 0 }
                ],
                
                customLots: [
                    { app: document.getElementById('app_name_retail').value || "Retail Min", lot: parseInt(document.getElementById('lot_retail').value) || 1 },
                    { app: document.getElementById('app_name_shni').value || "Small HNI", lot: parseInt(document.getElementById('lot_shni').value) || 14 },
                    { app: document.getElementById('app_name_bhni').value || "Big HNI", lot: parseInt(document.getElementById('lot_bhni').value) || 68 }
                ],

                fin: {
                    fy23: { yr: "FY-2023", ast: document.getElementById('fin_23_ast').value || '-', rev: document.getElementById('fin_23_rev').value || '-', exp: document.getElementById('fin_23_exp').value || '-', prf: document.getElementById('fin_23_prf').value || '-' },
                    fy24: { yr: "FY-2024", ast: document.getElementById('fin_24_ast').value || '-', rev: document.getElementById('fin_24_rev').value || '-', exp: document.getElementById('fin_24_exp').value || '-', prf: document.getElementById('fin_24_prf').value || '-' },
                    fy25: { yr: "FY-2025", ast: document.getElementById('fin_25_ast').value || '-', rev: document.getElementById('fin_25_rev').value || '-', exp: document.getElementById('fin_25_exp').value || '-', prf: document.getElementById('fin_25_prf').value || '-' },
                    fy26: { yr: "FY-2026", ast: document.getElementById('fin_26_ast').value || '-', rev: document.getElementById('fin_26_rev').value || '-', exp: document.getElementById('fin_26_exp').value || '-', prf: document.getElementById('fin_26_prf').value || '-' }
                }
            };

            dbData[ipoId] = ipoData;
            
            // ક્લાઉડ અને લોકલસ્ટોરેજ બંનેમાં સેવ કરો
            await saveAdminDataToCloud(dbData);

            alert(`✓ IPO "${ipoData.name}" successfully saved & synced to cloud!`);
            toggleDrawer(false);
            await loadAdminDashboard();
        });
    }
});

// ==========================================
// JSONBIN.IO CLOUD SYNC FUNCTIONS
// ==========================================
async function fetchAdminDataFromCloud() {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${ADMIN_BIN_ID}/latest`, {
            headers: { 'X-Master-Key': ADMIN_API_KEY }
        });
        if (response.ok) {
            const result = await response.json();
            const cloudData = result.record.ipos || result.record;
            if (cloudData && typeof cloudData === 'object' && Object.keys(cloudData).length > 0) {
                localStorage.setItem('live_ipo_master_cloud_data', JSON.stringify(cloudData));
                return cloudData;
            }
        }
    } catch (err) {
        console.error("Cloud fetch error, falling back to local storage:", err);
    }
    
    let local = JSON.parse(localStorage.getItem('live_ipo_master_cloud_data'));
    if (local && Object.keys(local).length > 0) return local;

    // Default Fallback
    return {
        "PSL": {
            id: "PSL",
            name: "Purple Style Labs IPO Details",
            logo: "https://www.liveipo.in/liveipo_logo.jpg",
            type: "Mainboard",
            priceBand: "546 to 575",
            lotRaw: 26,
            lotSize: "26 Shares",
            openDate: "2026-08-31",
            closeDate: "2026-09-02",
            allotmentDate: "2026-09-03",
            listingDate: "2026-09-07",
            gmp: "50",
            isAllotmentOut: false
        }
    };
}

async function saveAdminDataToCloud(dbData) {
    localStorage.setItem('live_ipo_master_cloud_data', JSON.stringify(dbData));
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${ADMIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': ADMIN_API_KEY
            },
            body: JSON.stringify({ ipos: dbData, updatedAt: new Date().toISOString() })
        });
    } catch (err) {
        console.error("Cloud sync error during save:", err);
    }
}

// ==========================================
// IPO સ્ટેટસ નક્કી કરવા માટેનું કોમન ફંક્શન
// ==========================================
function getIpoStatus(openStr, closeStr, allotStr, listStr, isAllotmentOut) {
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

    if (openDate && today < openDate) {
        return { text: "Upcoming", class: "status-upcoming-green" };
    } else if (openDate && closeDate && today >= openDate && today <= closeDate) {
        return { text: "🔴 Live", class: "status-live-blinking" };
    } else if (closeDate && today > closeDate && (!listDate || today < listDate)) {
        return { text: "Allotment Waiting", class: "status-waiting-orange" };
    } else if (listDate && today.getTime() === listDate.getTime()) {
        return { text: "Listing Today 🚀", class: "status-listing-indigo" };
    } else if (listDate && today > listDate) {
        return { text: "Listed", class: "status-listed-slate" };
    }

    return { text: "Closed", class: "status-listed-slate" };
}

// ==========================================
// ડેશબોર્ડ ડેટા લોડ અને ટેબલ રેન્ડર કરવા માટેનું ફંક્શન
// ==========================================
async function loadAdminDashboard() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    let db = await fetchAdminDataFromCloud();

    tbody.innerHTML = '';
    let total = 0, live = 0, upcoming = 0, allotment = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    Object.keys(db).forEach(key => {
        const ipo = db[key];
        if (!ipo) return;
        total++;

        const statusObj = getIpoStatus(ipo.openDate, ipo.closeDate, ipo.allotmentDate, ipo.listingDate, ipo.isAllotmentOut);

        const openD = ipo.openDate ? new Date(ipo.openDate) : null;
        const closeD = ipo.closeDate ? new Date(ipo.closeDate) : null;
        if (openD) openD.setHours(0, 0, 0, 0);
        if (closeD) closeD.setHours(0, 0, 0, 0);

        if (ipo.isAllotmentOut === true || (closeD && today > closeD)) {
            allotment++;
        } else if (openD && closeD && today >= openD && today <= closeD) {
            live++;
        } else if (openD && today < openD) {
            upcoming++;
        }

        let statusBg = "#dcfce7"; 
        let statusColor = "#166534";

        if (ipo.isAllotmentOut === true) {
            statusBg = "#bbf7d0";
            statusColor = "#065f46";
        } else if (statusObj.text.includes("Live")) {
            statusBg = "#fee2e2"; 
            statusColor = "#dc2626";
        } else if (statusObj.text.includes("Waiting")) {
            statusBg = "#ffedd5";
            statusColor = "#c2410c";
        } else if (statusObj.text.includes("Listing Today")) {
            statusBg = "#e0e7ff";
            statusColor = "#3730a3";
        }

        const isChecked = ipo.isAllotmentOut === true ? 'checked' : '';

        tbody.innerHTML += `
            <tr>
                <td><strong>${ipo.id}</strong></td>
                <td>
                    <span onclick="editIpo('${ipo.id}')" style="color: #1d4ed8; font-weight: 600; cursor: pointer; text-decoration: underline dotted;" title="Click for Full Edit">${ipo.name}</span><br>
                    <span style="font-size: 11px; color: #64748b;">Est: ₹${ipo.estPrice || '-'}</span>
                </td>
                <td><span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${ipo.type || 'Mainboard'}</span></td>
                <td style="text-align: center;">${formatDateReadable(ipo.openDate)}</td>
                <td style="text-align: center;">${formatDateReadable(ipo.closeDate)}</td>
                <td style="text-align: center;">${formatDateReadable(ipo.allotmentDate)}</td>
                <td style="text-align: center;">${formatDateReadable(ipo.listingDate)}</td>
                <td style="text-align: center; font-weight: bold;">₹${ipo.priceBand || '-'}</td>
                <td style="text-align: center;">${ipo.lotSize || (ipo.lotRaw + ' Shares')}</td>
                <td style="text-align: center;">
                    <input type="text" id="dash_gmp_${ipo.id}" value="${ipo.gmp || ''}" placeholder="0" style="width: 70px; padding: 4px; text-align: center; font-weight: 700; color: #166534; border: 1px solid #cbd5e1; border-radius: 4px;">
                </td>
                <td style="text-align: center;">
                    <label style="cursor: pointer; font-size: 11.5px; font-weight: 600; color: #7c3aed; display: inline-flex; align-items: center; gap: 4px;">
                        <input type="checkbox" id="dash_allot_${ipo.id}" ${isChecked} style="width: 15px; height: 15px;"> Out
                    </label>
                </td>
                <td><span style="background: ${statusBg}; color: ${statusColor}; padding: 3px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">${statusObj.text}</span></td>
                <td style="text-align: center;">
                    <div class="action-btns" style="justify-content: center; gap: 4px;">
                        <button type="button" onclick="quickSaveFromDashboard('${ipo.id}')" class="btn-action-edit" style="background: #166534; color: #fff;" title="Save GMP & Allotment">💾 Save</button>
                        <button type="button" onclick="editIpo('${ipo.id}')" class="btn-action-edit" title="Full Edit">✏️ Edit</button>
                        <button type="button" onclick="deleteIpo('${ipo.id}')" class="btn-action-del" title="Delete">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });

    if (document.getElementById('stat_total')) document.getElementById('stat_total').innerText = total;
    if (document.getElementById('stat_live')) document.getElementById('stat_live').innerText = live;
    if (document.getElementById('stat_upcoming')) document.getElementById('stat_upcoming').innerText = upcoming;
    if (document.getElementById('stat_allotment')) document.getElementById('stat_allotment').innerText = allotment;
}

// ડેશબોર્ડ ટેબલ પરથી જ ડાયરેક્ટ GMP અને અલોટમેન્ટ સેવ કરવા માટે
async function quickSaveFromDashboard(ipoId) {
    let dbData = await fetchAdminDataFromCloud();
    if (!dbData[ipoId]) return;

    const gmpInput = document.getElementById(`dash_gmp_${ipoId}`);
    const allotCheckbox = document.getElementById(`dash_allot_${ipoId}`);

    if (gmpInput) dbData[ipoId].gmp = gmpInput.value.trim();
    if (allotCheckbox) dbData[ipoId].isAllotmentOut = allotCheckbox.checked;

    await saveAdminDataToCloud(dbData);

    alert(`✓ IPO "${dbData[ipoId].name}" સફળતાપૂર્વક ક્લાઉડ પર અપડેટ થઈ ગયો છે!`);
    await loadAdminDashboard();
}

// ડ્રોઅર ઓપન/ક્લોઝ કરવા માટે
function toggleDrawer(show) {
    const drawer = document.getElementById('ipoFormDrawer');
    if (drawer) {
        drawer.style.display = show ? 'block' : 'none';
        if (show) window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// બટન ક્લિક થતાં ફોર્મ ખોલવા માટેનું મુખ્ય ફંક્શન (+ Add New IPO)
function openAddDrawer() {
    const form = document.getElementById('manageIpoForm');
    if (form) form.reset();
    
    const admId = document.getElementById('adm_id');
    if (admId) {
        admId.value = 'IPO' + Math.floor(1000 + Math.random() * 9000);
        admId.readOnly = false;
    }

    const drawerTitle = document.getElementById('drawerTitle');
    const saveBtn = document.getElementById('saveBtn');
    if (drawerTitle) drawerTitle.innerText = '➕ Add New IPO Complete Profile';
    if (saveBtn) saveBtn.innerText = '💾 Save & Publish IPO';
    
    toggleDrawer(true);
}

// એડિટ કરવા માટે
async function editIpo(id) {
    let db = await fetchAdminDataFromCloud();
    const ipo = db[id];
    if (!ipo) return;

    document.getElementById('adm_id').value = ipo.id;
    document.getElementById('adm_id').readOnly = true;
    document.getElementById('adm_name').value = ipo.name || '';
    document.getElementById('adm_logo').value = ipo.logo || '';
    document.getElementById('adm_type').value = ipo.type || 'Mainboard';
    document.getElementById('adm_about').value = ipo.about || '';
    
    document.getElementById('adm_isAllotmentOut').checked = ipo.isAllotmentOut || false;
    document.getElementById('adm_allotmentLink').value = ipo.registrarUrl || '';

    if (ipo.priceBand) {
        const parts = ipo.priceBand.split('to');
        if (parts.length === 2) {
            document.getElementById('adm_priceStart').value = parts[0].trim();
            document.getElementById('adm_priceEnd').value = parts[1].trim();
        } else {
            document.getElementById('adm_priceStart').value = ipo.priceBand;
        }
    }

    document.getElementById('adm_cutOff').value = ipo.cutOff || '';
    document.getElementById('adm_lotRaw').value = ipo.lotRaw || '';
    document.getElementById('adm_faceValue').value = ipo.faceValue || '';
    document.getElementById('adm_empDiscount').value = ipo.empDiscount || '';
    document.getElementById('adm_totalSize').value = ipo.totalSize || '';
    document.getElementById('adm_freshissue').value = ipo.freshIssue || '';
    document.getElementById('adm_ofs').value = ipo.ofs || '';
    document.getElementById('adm_listingAt').value = ipo.listingAt || '';
    
    if (ipo.listingAt) {
        document.getElementById('ex_bse').checked = ipo.listingAt.includes('BSE');
        document.getElementById('ex_nse').checked = ipo.listingAt.includes('NSE');
    }

    document.getElementById('adm_openDate').value = ipo.openDate || '';
    document.getElementById('adm_closeDate').value = ipo.closeDate || '';
    document.getElementById('adm_allotmentDate').value = ipo.allotmentDate || '';
    document.getElementById('adm_listingDate').value = ipo.listingDate || '';
    document.getElementById('adm_gmp').value = ipo.gmp || '';
    document.getElementById('adm_estPrice').value = ipo.estPrice || '';
    document.getElementById('adm_bookProfit').value = ipo.bookProfit || '';

    // એડિટ વખતે સબસ્ક્રિપ્શન શેર ડેટા ઇનપુટ બોક્સમાં ભરવા માટે
    if (ipo.subShares) {
        ipo.subShares.forEach(row => {
            if (row.cat === "QIB" && document.getElementById('sub_qib_off')) { document.getElementById('sub_qib_off').value = row.off; document.getElementById('sub_qib_app').value = row.app; }
            if (row.cat === "NII" && document.getElementById('sub_nii_off')) { document.getElementById('sub_nii_off').value = row.off; document.getElementById('sub_nii_app').value = row.app; }
            if (row.cat === "B-NII(₹10L+)" && document.getElementById('sub_bnii_off')) { document.getElementById('sub_bnii_off').value = row.off; document.getElementById('sub_bnii_app').value = row.app; }
            if (row.cat === "S-NII(₹2-10L)" && document.getElementById('sub_snii_off')) { document.getElementById('sub_snii_off').value = row.off; document.getElementById('sub_snii_app').value = row.app; }
            if (row.cat === "Retail" && document.getElementById('sub_retail_off')) { document.getElementById('sub_retail_off').value = row.off; document.getElementById('sub_retail_app').value = row.app; }
            if (row.cat === "Employee" && document.getElementById('sub_emp_off')) { document.getElementById('sub_emp_off').value = row.off; document.getElementById('sub_emp_app').value = row.app; }
            if (row.cat === "Shareholder" && document.getElementById('sub_sh_off')) { document.getElementById('sub_sh_off').value = row.off; document.getElementById('sub_sh_app').value = row.app; }
        });
    }

    // એડિટ વખતે એપ્લિકેશન બ્રેકઅપ ડેટા બોક્સમાં ભરવા માટે
    if (ipo.subApps) {
        ipo.subApps.forEach(row => {
            if (row.cat === "B-NII(₹10L+)" && document.getElementById('app_bnii_off')) { document.getElementById('app_bnii_off').value = row.off; document.getElementById('app_bnii_app').value = row.app; }
            if (row.cat === "S-NII(₹2-10L)" && document.getElementById('app_snii_off')) { document.getElementById('app_snii_off').value = row.off; document.getElementById('app_snii_app').value = row.app; }
            if (row.cat === "Retail" && document.getElementById('app_retail_off')) { document.getElementById('app_retail_off').value = row.off; document.getElementById('app_retail_app').value = row.app; }
        });
    }

    if (ipo.fin) {
        if (ipo.fin.fy23) { document.getElementById('fin_23_ast').value = ipo.fin.fy23.ast || ''; document.getElementById('fin_23_rev').value = ipo.fin.fy23.rev || ''; document.getElementById('fin_23_exp').value = ipo.fin.fy23.exp || ''; document.getElementById('fin_23_prf').value = ipo.fin.fy23.prf || ''; }
        if (ipo.fin.fy24) { document.getElementById('fin_24_ast').value = ipo.fin.fy24.ast || ''; document.getElementById('fin_24_rev').value = ipo.fin.fy24.rev || ''; document.getElementById('fin_24_exp').value = ipo.fin.fy24.exp || ''; document.getElementById('fin_24_prf').value = ipo.fin.fy24.prf || ''; }
        if (ipo.fin.fy25) { document.getElementById('fin_25_ast').value = ipo.fin.fy25.ast || ''; document.getElementById('fin_25_rev').value = ipo.fin.fy25.rev || ''; document.getElementById('fin_25_exp').value = ipo.fin.fy25.exp || ''; document.getElementById('fin_25_prf').value = ipo.fin.fy25.prf || ''; }
        if (ipo.fin.fy26) { document.getElementById('fin_26_ast').value = ipo.fin.fy26.ast || ''; document.getElementById('fin_26_rev').value = ipo.fin.fy26.rev || ''; document.getElementById('fin_26_exp').value = ipo.fin.fy26.exp || ''; document.getElementById('fin_26_prf').value = ipo.fin.fy26.prf || ''; }
    }

    const drawerTitle = document.getElementById('drawerTitle');
    const saveBtn = document.getElementById('saveBtn');
    if (drawerTitle) drawerTitle.innerText = `✏️ Edit IPO Profile: ${ipo.id}`;
    if (saveBtn) saveBtn.innerText = 'Update IPO Details';
    toggleDrawer(true);
}

// ડીલીટ કરવા માટે
async function deleteIpo(id) {
    if (confirm(`Are you sure you want to delete IPO: ${id}?`)) {
        let dbData = await fetchAdminDataFromCloud();
        delete dbData[id];
        
        await saveAdminDataToCloud(dbData);

        await loadAdminDashboard();
        alert(`✓ IPO ${id} deleted successfully from cloud.`);
    }
}

// તારીખ રીડેબલ ફોર્મેટ કરવા માટે
function formatDateReadable(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('en-GB', options);
}

// નવો રજિસ્ટ્રાર ઉમેરવાનું બોક્સ ખોલવા/બંધ કરવા માટે
function toggleNewRegistrarBox() {
    const box = document.getElementById('newRegistrarBox');
    if (box) {
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }
}

// પેજ લોડ થાય ત્યારે ડ્રોપડાઉનમાં રજિસ્ટ્રાર લોડ કરવા માટે
function loadRegistrarDropdown() {
    const selectEl = document.getElementById('adm_registrarSelect');
    if (!selectEl) return;

    let registrars = JSON.parse(localStorage.getItem('live_ipo_registrars')) || [
        { name: "Link Intime India Pvt Ltd", url: "https://linkintime.co.in/initial_offer/default.aspx" },
        { name: "KFin Technologies Ltd", url: "https://kosmic.kfintech.com/ipostatus/" },
        { name: "Bigshare Services Pvt Ltd", url: "https://ipo.bigshareonline.com/ipo_status.html" }
    ];

    selectEl.innerHTML = '<option value="">-- Select Registrar --</option>';
    registrars.forEach(reg => {
        const option = document.createElement('option');
        option.value = reg.url;
        option.textContent = reg.name;
        selectEl.appendChild(option);
    });
}

// નવો રજિસ્ટ્રાર ડ્રોપડાઉનમાં એડ કરવા માટે
function addNewRegistrarOption() {
    const nameInput = document.getElementById('newRegName');
    const urlInput = document.getElementById('newRegUrl');

    const name = nameInput.value.trim();
    const url = urlInput.value.trim();

    if (!name || !url) {
        alert('કૃપા કરીને રજિસ્ટ્રારનું નામ અને યુઆરએલ બંને દાખલ કરો.');
        return;
    }

    let registrars = JSON.parse(localStorage.getItem('live_ipo_registrars')) || [
        { name: "Link Intime India Pvt Ltd", url: "https://linkintime.co.in/initial_offer/default.aspx" },
        { name: "KFin Technologies Ltd", url: "https://kosmic.kfintech.com/ipostatus/" },
        { name: "Bigshare Services Pvt Ltd", url: "https://ipo.bigshareonline.com/ipo_status.html" }
    ];

    registrars.push({ name: name, url: url });
    localStorage.setItem('live_ipo_registrars', JSON.stringify(registrars));

    loadRegistrarDropdown();
    document.getElementById('adm_registrarSelect').value = url;

    nameInput.value = '';
    urlInput.value = '';
    toggleNewRegistrarBox();

    alert(`✓ નવો રજિસ્ટ્રાર "${name}" સફળતાપૂર્વક ઉમેરાઈ ગયો છે!`);
}

// રજિસ્ટ્રાર મેનેજમેન્ટ વ્યુ સ્વિચ કરવા માટે
async function switchAdminView(viewName, event) {
    if (event) event.preventDefault();
    
    const dashboardCard = document.querySelector('.content-card');
    const registrarsSec = document.getElementById('registrarsSection');
    const formDrawer = document.getElementById('ipoFormDrawer');
    
    document.querySelectorAll('.admin-menu a').forEach(a => a.classList.remove('active'));
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    if (viewName === 'registrars') {
        if (dashboardCard) dashboardCard.style.display = 'none';
        if (formDrawer) formDrawer.style.display = 'none';
        if (registrarsSec) {
            registrarsSec.style.display = 'block';
            loadRegistrarsTable();
        }
    } else {
        if (dashboardCard) dashboardCard.style.display = 'block';
        if (registrarsSec) registrarsSec.style.display = 'none';
        await loadAdminDashboard();
    }
}

// રજિસ્ટ્રાર ટેબલ લોડ કરવા માટે
function loadRegistrarsTable() {
    const tbody = document.getElementById('registrarsTableBody');
    if (!tbody) return;

    let registrars = JSON.parse(localStorage.getItem('live_ipo_registrars')) || [
        { name: "Link Intime India Pvt Ltd", url: "https://linkintime.co.in/initial_offer/default.aspx" },
        { name: "KFin Technologies Ltd", url: "https://kosmic.kfintech.com/ipostatus/" },
        { name: "Bigshare Services Pvt Ltd", url: "https://ipo.bigshareonline.com/ipo_status.html" }
    ];

    tbody.innerHTML = '';
    registrars.forEach((reg, index) => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${reg.name}</strong></td>
                <td><a href="${reg.url}" target="_blank" style="color: #0284c7; text-decoration: underline;">${reg.url}</a></td>
                <td style="text-align: center;">
                    <button type="button" onclick="editRegistrar(${index})" class="btn-action-edit">✏️ Edit</button>
                    <button type="button" onclick="deleteRegistrar(${index})" class="btn-action-del">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });
}

// રજિસ્ટ્રાર એડિટ કરવા માટે
function editRegistrar(index) {
    let registrars = JSON.parse(localStorage.getItem('live_ipo_registrars')) || [];
    const reg = registrars[index];
    if (!reg) return;

    const newName = prompt("રજિસ્ટ્રારનું નવું નામ દાખલ કરો:", reg.name);
    if (newName === null) return;

    const newUrl = prompt("રજિસ્ટ્રારની નવી URL દાખલ કરો:", reg.url);
    if (newUrl === null) return;

    if (newName.trim() && newUrl.trim()) {
        registrars[index] = { name: newName.trim(), url: newUrl.trim() };
        localStorage.setItem('live_ipo_registrars', JSON.stringify(registrars));
        loadRegistrarsTable();
        loadRegistrarDropdown();
        alert("✓ રજિસ્ટ્રાર સફળતાપૂર્વક અપડેટ થઈ ગયો છે!");
    } else {
        alert("નામ અને URL ખાલી ન હોઈ શકે.");
    }
}

// રજિસ્ટ્રાર ડિલીટ કરવા માટે
function deleteRegistrar(index) {
    let registrars = JSON.parse(localStorage.getItem('live_ipo_registrars')) || [];
    if (confirm("શું તમે ખરેખર આ રજિસ્ટ્રારને ડિલીટ કરવા માંગો છો?")) {
        registrars.splice(index, 1);
        localStorage.setItem('live_ipo_registrars', JSON.stringify(registrars));
        loadRegistrarsTable();
        loadRegistrarDropdown();
        alert("✓ રજિસ્ટ્રાર ડિલીટ થઈ ગયો છે.");
    }
}