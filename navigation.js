// navigation.js
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const views = document.querySelectorAll('.content-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // استهداف العرض بناءً على معرف الرابط (e.g., nav-main -> view-main)
            const targetViewId = link.id.replace('nav-', 'view-');
            const targetView = document.getElementById(targetViewId);

            // إزالة النشاط من الجميع
            navLinks.forEach(nav => nav.classList.remove('active'));
            views.forEach(view => view.classList.remove('active'));

            // تنشيط الرابط والعرض المستهدف
            if(targetView) {
                link.classList.add('active');
                targetView.classList.add('active');
            }
        });
    });
});