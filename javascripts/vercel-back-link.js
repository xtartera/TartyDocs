document.addEventListener('DOMContentLoaded', function () {
  var currentUrl = window.location.href;
  document.querySelectorAll('a[href*="vercel.app"]').forEach(function (link) {
    try {
      var url = new URL(link.href);
      url.searchParams.set('back', currentUrl);
      link.href = url.toString();
    } catch (e) {}
  });
});
