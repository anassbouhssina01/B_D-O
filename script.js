"use strict";

document.addEventListener('DOMContentLoaded', () => {
    console.log("تم تحميل ملف script.js المحدّث!");

    // ================== عناصر واجهة المستخدم (محدثة) ==================
    const savePathButton = document.getElementById('save-path-button');
    const exportExcelButton = document.getElementById('export-excel-button');
    
    // عناصر النموذج الموحد
    const mailForm = document.getElementById('mail-form');
    const mailTypeSelect = document.getElementById('mail-type-select');
    const incomingFieldsContainer = document.getElementById('incoming-fields-container');
    const outgoingFieldsContainer = document.getElementById('outgoing-fields-container');
    const debtFieldsContainer = document.getElementById('debt-fields-container');
    const incomingInstitutionTypeInput = document.getElementById('incoming-institution-type');
    const submitMailButton = document.getElementById('submit-mail-button');

    // (جديد) عناصر الربط والبحث الآلي
    const outgoingReplyToInput = document.getElementById('outgoing-reply-to');
    const incomingAutocompleteResults = document.getElementById('incoming-autocomplete-results');
    const incomingLinkToOutgoingCheck = document.getElementById('incoming-link-to-outgoing-check');
    const incomingLinkToOutgoingContainer = document.getElementById('incoming-link-to-outgoing-container');
    const incomingLinkToOutgoingSearch = document.getElementById('incoming-link-to-outgoing-search');
    const outgoingAutocompleteResults = document.getElementById('outgoing-autocomplete-results');


    // عناصر الجداول
    const incomingTableBody = document.querySelector('#incoming-table tbody');
    const incomingTableBodyGlobal = document.querySelector('#incoming-table-global tbody');
    const outgoingTableBodyGlobal = document.querySelector('#outgoing-table-global tbody');

    // عناصر البحث (الرئيسية)
    const searchIncomingInput = document.getElementById('search-incoming');
    
    // (جديد) عناصر البحث الشامل والفلاتر
    const searchIncomingGlobalInput = document.getElementById('search-incoming-global');
    const searchOutgoingGlobalInput = document.getElementById('search-outgoing-global');
    const globalSearchButton = document.getElementById('global-search-button');
    const searchDateFrom = document.getElementById('search-date-from');
    const searchDateTo = document.getElementById('search-date-to');
    const searchType = document.getElementById('search-type');
    const searchCourtName = document.getElementById('search-court-name');

    // عناصر الاستيراد
    const importJsonCheck = document.getElementById('import-json-check');
    const jsonFileInput = document.getElementById('json-file-input');
    
    // عناصر الإحصائيات
    const statsTotal = document.getElementById('stats-total-count');
    const statsIncoming = document.getElementById('stats-incoming-count');
    const statsOutgoing = document.getElementById('stats-outgoing-count');
    
    // متغيرات الحالة
    let editingId = null; 
    let editingType = null; // 'incoming' or 'outgoing'
    let fileHandle;
    let data = {
        incoming: [],
        outgoing: []
    };

    // ================== إدارة الملفات (لا تغيير) ==================
    savePathButton.addEventListener('click', async () => {
        try {
            fileHandle = await window.showSaveFilePicker({
                suggestedName: 'data.json',
                types: [{
                    description: 'JSON Files',
                    accept: { 'application/json': ['.json'] },
                }],
            });
            savePathButton.textContent = `مسار الحفظ: ${fileHandle.name}`;
            await loadData();
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error("خطأ في اختيار مسار الحفظ:", err);
            }
        }
    });

    async function saveData() {
        if (!fileHandle) return;
        try {
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(data, null, 2));
            await writable.close();
        } catch (err) {
            console.error("خطأ في حفظ البيانات:", err);
        }
    }

    async function loadData() {
        if (!fileHandle) return;
        try {
            const file = await fileHandle.getFile();
            const contents = await file.text();
            data = contents ? JSON.parse(contents) : { incoming: [], outgoing: [] };
            if (!data.incoming) data.incoming = [];
            if (!data.outgoing) data.outgoing = [];
        } catch (err) {
            data = { incoming: [], outgoing: [] };
        }
        renderTables();
    }
    
    // ================== عرض البيانات (محدث) ==================
    function renderTables(displayData = data) {
        // تحديث الجداول في كل مكان
        renderIncomingTable(incomingTableBody, displayData.incoming || []);
        // عند التحميل الأول، اعرض كل شيء في البحث الشامل
        renderIncomingTable(incomingTableBodyGlobal, displayData.incoming || []);
        renderOutgoingTable(outgoingTableBodyGlobal, displayData.outgoing || []);
        updateStats();
    }
    
    function renderIncomingTable(tbody, incomingData) {
        tbody.innerHTML = '';
        incomingData.forEach(mail => {
            const row = tbody.insertRow();
            row.dataset.id = mail.id;
            row.dataset.regNumber = mail.regNumber;
            // (جديد) إضافة رقم الإرسالية المرتبط
            row.dataset.linkedDispatch = mail.linkedOutgoingDispatch || ''; 
            row.innerHTML = `
                <td>${mail.court || ''}</td>
                <td>${mail.ppr || ''}</td>
                <td>${mail.regNumber || ''}</td>
                <td>${mail.contactDate || ''}</td>
                <td>${mail.employeeName || ''}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-type="incoming" data-id="${mail.id}">تعديل</button>
                    <button class="delete-btn" data-type="incoming" data-id="${mail.id}">حذف</button>
                </td>
            `;
        });
    }

    function renderOutgoingTable(tbody, outgoingData) {
        tbody.innerHTML = '';
        outgoingData.forEach(mail => {
            const row = tbody.insertRow();
            row.dataset.id = mail.id;
            row.dataset.replyTo = mail.replyTo;
            row.innerHTML = `
                <td>${mail.dispatchNumber || ''}</td>
                <td>${mail.dispatchDate || ''}</td>
                <td>${mail.subject || ''}</td>
                <td>${mail.replyTo || ''}</td>
                <td class="action-buttons">
                    <button class="edit-btn" data-type="outgoing" data-id="${mail.id}">تعديل</button>
                    <button class="delete-btn" data-type="outgoing" data-id="${mail.id}">حذف</button>
                </td>
            `;
        });
    }

    function updateStats() {
        const incomingCount = data.incoming.length;
        const outgoingCount = data.outgoing.length;
        statsIncoming.textContent = incomingCount;
        statsOutgoing.textContent = outgoingCount;
        statsTotal.textContent = incomingCount + outgoingCount;
    }

    // ================== منطق النموذج الموحد (محدث) ==================

    mailTypeSelect.addEventListener('change', () => {
        const type = mailTypeSelect.value;
        incomingFieldsContainer.classList.toggle('hidden', type !== 'incoming');
        outgoingFieldsContainer.classList.toggle('hidden', type !== 'outgoing');
        submitMailButton.style.display = (type === 'incoming' || type === 'outgoing') ? 'block' : 'none';
        
        if (!editingId) {
            editingType = type;
        }
        
        toggleDebtFields(); 
    });

    incomingInstitutionTypeInput.addEventListener('input', toggleDebtFields);
    
    function toggleDebtFields() {
        const show = incomingInstitutionTypeInput.value.trim().toLowerCase() === 'ديمومة';
        debtFieldsContainer.classList.toggle('hidden', !show);
    }

    // (جديد) معالج إظهار/إخفاء ربط البريد الوارد
    incomingLinkToOutgoingCheck.addEventListener('change', (e) => {
        incomingLinkToOutgoingContainer.classList.toggle('hidden', !e.target.checked);
        if (!e.target.checked) {
            incomingLinkToOutgoingSearch.value = ''; // مسح القيمة عند إلغاء التحديد
        }
    });

    // معالج الإرسال الموحد
    mailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const type = editingType || mailTypeSelect.value;
        if (type === 'incoming') {
            handleIncomingSubmit();
        } else if (type === 'outgoing') {
            handleOutgoingSubmit();
        }
        
        resetEditState();
        renderTables(); // تحديث كل الجداول
        await saveData();
        
        document.getElementById('nav-main').click();
    });

    function handleIncomingSubmit() {
        const mailData = {
            court: document.getElementById('incoming-court').value,
            ppr: document.getElementById('incoming-ppr').value,
            regNumber: document.getElementById('incoming-reg-number').value,
            contactDate: document.getElementById('incoming-contact-date').value,
            institutionType: document.getElementById('incoming-institution-type').value,
            employeeName: document.getElementById('incoming-employee-name').value,
            debtPeriod: document.getElementById('incoming-debt-period').value,
            entryYear: document.getElementById('incoming-entry-year').value,
            increaseStructure: document.getElementById('incoming-increase-structure').value,
            count: document.getElementById('incoming-count').value,
            editDate: document.getElementById('incoming-edit-date').value,
            responsibleEmployee: document.getElementById('responsible-employee').value,
            // (جديد) حفظ رقم الإرسالية المرتبط
            linkedOutgoingDispatch: incomingLinkToOutgoingSearch.value || '', 
        };

        if (editingId && editingType === 'incoming') {
            const index = data.incoming.findIndex(m => m.id === editingId);
            if (index !== -1) {
                data.incoming[index] = { ...data.incoming[index], ...mailData };
            }
        } else {
            mailData.id = Date.now();
            data.incoming.push(mailData);
        }
    }

    function handleOutgoingSubmit() {
        const mailData = {
            dispatchNumber: document.getElementById('outgoing-dispatch-number').value,
            dispatchDate: document.getElementById('outgoing-dispatch-date').value,
            count: document.getElementById('outgoing-count').value,
            subject: document.getElementById('outgoing-subject').value,
            documentsLink: document.getElementById('outgoing-documents-link').value,
            replyTo: document.getElementById('outgoing-reply-to').value,
        };
        
        // (جديد) التحقق من وجود البريد الوارد المرتبط
        const linkedIncoming = data.incoming.find(m => m.regNumber === mailData.replyTo);
        if (!linkedIncoming) {
            // يمكن السماح بحالات نادرة، لكن حاليًا سنفرض الاختيار
            alert("خطأ: يجب اختيار بريد وارد صالح من القائمة (عبر رقم التسجيل).");
            return; 
        }

        if (editingId && editingType === 'outgoing') {
            const index = data.outgoing.findIndex(m => m.id === editingId);
            if (index !== -1) {
                data.outgoing[index] = { ...data.outgoing[index], ...mailData };
            }
        } else {
            mailData.id = Date.now();
            data.outgoing.push(mailData);
        }
    }

    // ================== إدارة الأحداث (محدث) ==================
    
    function setupEventListeners() {
        const mainView = document.getElementById('view-main');
        const searchView = document.getElementById('view-search');
        
        mainView.addEventListener('click', handleTableClick);
        searchView.addEventListener('click', handleTableClick);

        // (جديد) إعداد البحث الآلي
        setupAutocomplete(
            outgoingReplyToInput, 
            incomingAutocompleteResults, 
            () => data.incoming, 
            'regNumber', 
            (mail) => `${mail.regNumber} (${mail.employeeName || 'غير محدد'}) - ${mail.court || 'غير محدد'}`,
            (mail) => { outgoingReplyToInput.value = mail.regNumber; }
        );

        setupAutocomplete(
            incomingLinkToOutgoingSearch,
            outgoingAutocompleteResults,
            () => data.outgoing,
            'dispatchNumber',
            (mail) => `${mail.dispatchNumber} - ${mail.subject || 'بلا موضوع'}`,
            (mail) => { incomingLinkToOutgoingSearch.value = mail.dispatchNumber; }
        );
    }

    function handleTableClick(e) {
        const target = e.target;
        const button = target.closest('button');
        const row = target.closest('tr');

        if (button) {
            const id = Number(button.dataset.id);
            const type = button.dataset.type;
            if (button.classList.contains('delete-btn')) {
                handleDelete(id, type);
            } else if (button.classList.contains('edit-btn')) {
                handleEdit(id, type);
            }
        } else if (row) {
            handleRowClick(row, e.currentTarget); 
        }
    }

    async function handleDelete(id, type) {
        if (!confirm('هل أنت متأكد من رغبتك في الحذف؟')) {
            return;
        }
        data[type] = data[type].filter(mail => mail.id !== id);
        
        // (جديد) تحديث العرض بناءً على الصفحة
        if (document.getElementById('view-main').classList.contains('active')) {
            filterHomeData();
        } else {
            filterAndRenderGlobalSearch();
        }
        
        await saveData();
    }

    function handleEdit(id, type) {
        const mail = data[type].find(m => m.id === id);
        if (!mail) return;

        editingId = id;
        editingType = type;

        document.getElementById('nav-add-mail').click();
        mailTypeSelect.value = type;
        mailTypeSelect.dispatchEvent(new Event('change')); 

        if (type === 'incoming') {
            document.getElementById('incoming-court').value = mail.court || '';
            document.getElementById('incoming-ppr').value = mail.ppr || '';
            document.getElementById('incoming-reg-number').value = mail.regNumber || '';
            document.getElementById('incoming-contact-date').value = mail.contactDate || '';
            document.getElementById('incoming-institution-type').value = mail.institutionType || '';
            document.getElementById('incoming-employee-name').value = mail.employeeName || '';
            document.getElementById('incoming-debt-period').value = mail.debtPeriod || '';
            document.getElementById('incoming-entry-year').value = mail.entryYear || '';
            document.getElementById('incoming-increase-structure').value = mail.increaseStructure || '';
            document.getElementById('incoming-count').value = mail.count || '';
            document.getElementById('incoming-edit-date').value = mail.editDate || '';
            document.getElementById('responsible-employee').value = mail.responsibleEmployee || '';
            
            // (جديد) ملء حقل الربط بالبريد الصادر
            const linkedDispatch = mail.linkedOutgoingDispatch || '';
            incomingLinkToOutgoingSearch.value = linkedDispatch;
            incomingLinkToOutgoingCheck.checked = !!linkedDispatch;
            incomingLinkToOutgoingContainer.classList.toggle('hidden', !linkedDispatch);

            toggleDebtFields();
            
        } else { // outgoing
            document.getElementById('outgoing-dispatch-number').value = mail.dispatchNumber || '';
            document.getElementById('outgoing-dispatch-date').value = mail.dispatchDate || '';
            document.getElementById('outgoing-count').value = mail.count || '';
            document.getElementById('outgoing-subject').value = mail.subject || '';
            document.getElementById('outgoing-documents-link').value = mail.documentsLink || '';
            document.getElementById('outgoing-reply-to').value = mail.replyTo || '';
        }
        
        submitMailButton.textContent = 'تحديث البيانات';
    }
    
    function resetEditState() {
        editingId = null;
        editingType = null;
        mailForm.reset();
        
        mailTypeSelect.value = '';
        incomingFieldsContainer.classList.add('hidden');
        outgoingFieldsContainer.classList.add('hidden');
        debtFieldsContainer.classList.add('hidden');
        submitMailButton.style.display = 'none';
        
        // (جديد) إعادة تعيين حقول الربط
        incomingLinkToOutgoingCheck.checked = false;
        incomingLinkToOutgoingContainer.classList.add('hidden');
        incomingLinkToOutgoingSearch.value = '';
        
        submitMailButton.textContent = 'إضافة';
    }
    
    function handleRowClick(row, context) {
        const incomingTable = context.querySelector('#incoming-table, #incoming-table-global');
        const outgoingTable = context.querySelector('#outgoing-table-global');

        document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));
        
        const regNumber = row.dataset.regNumber; // موجود في صف وارد
        const linkedDispatch = row.dataset.linkedDispatch; // (جديد) موجود في صف وارد
        const replyTo = row.dataset.replyTo;     // موجود في صف صادر

        if (regNumber && outgoingTable) {
            row.classList.add('highlight');
            // تظليل الصادر المرتبط بـ (replyTo)
            outgoingTable.querySelectorAll(`tbody tr[data-reply-to="${regNumber}"]`).forEach(r => r.classList.add('highlight'));
            // (جديد) تظليل الصادر المرتبط بـ (linkedDispatch)
            if (linkedDispatch) {
                const linkedRow = outgoingTable.querySelector(`tbody tr[data-dispatch-number="${linkedDispatch}"]`);
                if (linkedRow) linkedRow.classList.add('highlight');
            }
        } else if (replyTo && incomingTable) {
            row.classList.add('highlight');
            // تظليل الوارد المرتبط به
            const relatedRow = incomingTable.querySelector(`tbody tr[data-reg-number="${replyTo}"]`);
            if (relatedRow) relatedRow.classList.add('highlight');
        }
    }
    
    // ================== (جديد) منطق البحث الآلي (Autocomplete) ==================
    
    function setupAutocomplete(inputEl, resultsEl, searchDataSource, searchField, displayFieldFn, onSelect) {
        inputEl.addEventListener('input', () => {
            const term = inputEl.value.toLowerCase();
            const searchData = searchDataSource(); // استدعاء الدالة للحصول على البيانات المحدثة
            
            if (term.length < 1) {
                resultsEl.innerHTML = '';
                resultsEl.classList.remove('active');
                return;
            }
            
            const results = searchData.filter(item => 
                String(item[searchField]).toLowerCase().includes(term)
            );
            
            resultsEl.innerHTML = '';
            if (results.length > 0) {
                results.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.classList.add('autocomplete-item');
                    itemEl.textContent = displayFieldFn(item);
                    itemEl.addEventListener('click', () => {
                        onSelect(item);
                        resultsEl.innerHTML = '';
                        resultsEl.classList.remove('active');
                    });
                    resultsEl.appendChild(itemEl);
                });
                resultsEl.classList.add('active');
            } else {
                resultsEl.innerHTML = '<div class="autocomplete-item">لا توجد نتائج</div>';
                resultsEl.classList.add('active');
            }
        });
        
        // إخفاء النتائج عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) {
                resultsEl.innerHTML = '';
                resultsEl.classList.remove('active');
            }
        });
    }

    // ================== البحث (مقسم) ==================

    // (معدل) بحث الصفحة الرئيسية فقط
    function filterHomeData() {
        const incomingTerm = searchIncomingInput.value.toLowerCase();

        const filteredIncoming = data.incoming.filter(mail =>
            Object.values(mail).some(value => String(value).toLowerCase().includes(incomingTerm))
        );
        renderIncomingTable(incomingTableBody, filteredIncoming);
    }
    searchIncomingInput.addEventListener('input', filterHomeData);

    // (جديد) بحث الصفحة الشاملة (يتم تفعيله بالزر)
    globalSearchButton.addEventListener('click', filterAndRenderGlobalSearch);

    function filterAndRenderGlobalSearch() {
        // 1. جلب كل قيم الفلاتر
        const incomingTerm = searchIncomingGlobalInput.value.toLowerCase();
        const outgoingTerm = searchOutgoingGlobalInput.value.toLowerCase();
        const dateFrom = searchDateFrom.value;
        const dateTo = searchDateTo.value;
        const type = searchType.value;
        const courtName = searchCourtName.value.toLowerCase();
        
        let filteredIncoming = [...data.incoming];
        let filteredOutgoing = [...data.outgoing];

        // 2. الفلترة حسب النوع
        if (type === 'incoming') {
            filteredOutgoing = [];
        } else if (type === 'outgoing') {
            filteredIncoming = [];
        }

        // 3. تطبيق الفلاتر على البريد الوارد (إن لم يتم إلغاؤه)
        if (filteredIncoming.length > 0) {
            filteredIncoming = filteredIncoming.filter(mail => {
                const matchesKeyword = incomingTerm ? Object.values(mail).some(value => String(value).toLowerCase().includes(incomingTerm)) : true;
                const matchesCourt = courtName ? String(mail.court).toLowerCase().includes(courtName) : true;
                const matchesDate = (!dateFrom || mail.contactDate >= dateFrom) && (!dateTo || mail.contactDate <= dateTo);
                return matchesKeyword && matchesCourt && matchesDate;
            });
        }

        // 4. تطبيق الفلاتر على البريد الصادر (إن لم يتم إلغاؤه)
        if (filteredOutgoing.length > 0) {
            filteredOutgoing = filteredOutgoing.filter(mail => {
                const matchesKeyword = outgoingTerm ? Object.values(mail).some(value => String(value).toLowerCase().includes(outgoingTerm)) : true;
                const matchesDate = (!dateFrom || mail.dispatchDate >= dateFrom) && (!dateTo || mail.dispatchDate <= dateTo);
                return matchesKeyword && matchesDate;
            });
        }
        
        // 5. (جديد) منطق "المسار الكامل"
        // إذا كان البحث يشمل كلاهما، ابحث عن الروابط
        if (type === '') {
            const incomingResultsRegNumbers = new Set(filteredIncoming.map(m => m.regNumber));
            const incomingResultsLinkedDispatch = new Set(filteredIncoming.map(m => m.linkedOutgoingDispatch).filter(Boolean));
            
            const outgoingResultsDispatchNumbers = new Set(filteredOutgoing.map(m => m.dispatchNumber));
            const outgoingResultsReplyTo = new Set(filteredOutgoing.map(m => m.replyTo).filter(Boolean));

            // أضف الصادر المرتبط بنتائج الوارد
            const linkedOutgoing = data.outgoing.filter(m => 
                outgoingResultsDispatchNumbers.has(m.dispatchNumber) || // موجود مسبقاً
                incomingResultsRegNumbers.has(m.replyTo) || // رد على نتيجة وارد
                incomingResultsLinkedDispatch.has(m.dispatchNumber) // مرتبط بنتيجة وارد
            );
            
            // أضف الوارد المرتبط بنتائج الصادر
            const linkedIncoming = data.incoming.filter(m => 
                incomingResultsRegNumbers.has(m.regNumber) || // موجود مسبقاً
                outgoingResultsReplyTo.has(m.regNumber) || // نتيجة صادر هي رد عليه
                outgoingResultsDispatchNumbers.has(m.linkedOutgoingDispatch) // مرتبط بنتيجة صادر
            );
            
            filteredIncoming = [...new Set([...filteredIncoming, ...linkedIncoming])];
            filteredOutgoing = [...new Set([...filteredOutgoing, ...linkedOutgoing])];
        }

        // 6. عرض النتائج النهائية
        renderIncomingTable(incomingTableBodyGlobal, filteredIncoming);
        renderOutgoingTable(outgoingTableBodyGlobal, filteredOutgoing);
    }
    
    // ================== استيراد JSON (محدث) ==================
    importJsonCheck.addEventListener('change', () => {
        jsonFileInput.style.display = importJsonCheck.checked ? 'block' : 'none';
    });
    jsonFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                document.getElementById('incoming-court').value = json.court || '';
                document.getElementById('incoming-ppr').value = json.ppr || '';
                document.getElementById('incoming-employee-name').value = json.employeeName || '';
                
                if (json.institutionType) {
                    document.getElementById('incoming-institution-type').value = json.institutionType;
                    toggleDebtFields();
                }
                
            } catch (err) {
                alert("ملف JSON غير صالح.");
            }
        };
        reader.readAsText(file);
    });

    // ================== تصدير إلى Excel (لا تغيير) ==================
    exportExcelButton.addEventListener('click', () => {
        if (data.incoming.length === 0 && data.outgoing.length === 0) {
            alert("لا توجد بيانات لتصديرها.");
            return;
        }
        const wb = XLSX.utils.book_new();
        const incomingSheetData = data.incoming.map(({ id, ...rest }) => rest);
        const wsIncoming = XLSX.utils.json_to_sheet(incomingSheetData);
        XLSX.utils.book_append_sheet(wb, wsIncoming, "البريد الوارد");
        
        const outgoingSheetData = data.outgoing.map(({ id, ...rest }) => rest);
        const wsOutgoing = XLSX.utils.json_to_sheet(outgoingSheetData);
        XLSX.utils.book_append_sheet(wb, wsOutgoing, "البريد الصادر");
        
        XLSX.writeFile(wb, "بيانات_مكتب_الضبط.xlsx");
    });
    
    // بدء تشغيل المستمعين للأحداث
    setupEventListeners();
    // إخفاء الحقول المشروطة عند التحميل الأولي
    toggleDebtFields();
    incomingLinkToOutgoingContainer.classList.add('hidden'); // إخفاء حقل الربط الاختياري
});