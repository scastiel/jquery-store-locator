all: zip

zip: dist/simple_jquery_store_locator.zip dist/screenshots.zip

dist/simple_jquery_store_locator.zip:
	mkdir -p dist
	zip -r dist/simple_jquery_store_locator.zip README.md example jquery.storelocator.js

dist/screenshots.zip:
	mkdir -p dist
	zip dist/screenshots.zip images/screenshot*.png

clean:
	rm -Rf dist
