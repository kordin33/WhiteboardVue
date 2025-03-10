import os
import re
from django.shortcuts import render
from django.conf import settings
from django.views.generic import TemplateView
from django.views.decorators.cache import never_cache

# Wzór do dopasowania plików JS i CSS w katalogu dist Vue
CSS_PATTERN = re.compile(r'^css/.*\.css$')
JS_PATTERN = re.compile(r'^js/.*\.js$')

class VueAppView(TemplateView):
    """
    Widok dla aplikacji Vue.js.
    Serwuje szablon Django, który albo przekierowuje do deweloperskiego serwera Vue w trybie debug,
    albo ładuje zbudowane pliki Vue.js w trybie produkcyjnym.
    """
    template_name = 'vue_index.html'

    @never_cache
    def get(self, request, *args, **kwargs):
        context = self.get_context_data(**kwargs)

        # W trybie produkcyjnym, odczytaj zbudowane pliki Vue
        if not settings.DEBUG:
            vue_dir = os.path.join(settings.STATIC_ROOT, 'vue')
            if os.path.exists(vue_dir):
                # Lista plików CSS
                css_files = []
                for root, dirs, files in os.walk(os.path.join(vue_dir, 'css')):
                    for file in files:
                        if file.endswith('.css'):
                            rel_path = os.path.join('css', file)
                            css_files.append(rel_path)

                # Lista plików JS
                js_files = []
                for root, dirs, files in os.walk(os.path.join(vue_dir, 'js')):
                    for file in files:
                        if file.endswith('.js'):
                            rel_path = os.path.join('js', file)
                            js_files.append(rel_path)

                # Sortowanie plików (chunk-vendors.js powinien być pierwszy)
                js_files = sorted(js_files, key=lambda x: 0 if 'chunk-vendors' in x else 1)

                context['vue_css_files'] = css_files
                context['vue_js_files'] = js_files

        return self.render_to_response(context)

# Prosta funkcja widoku
vue_app_view = never_cache(VueAppView.as_view())