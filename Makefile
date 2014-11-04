.PHONY: all test lint

all: lint test

clean:
	rm -r build

test:
	grunt test
	bash tests/snapshots_test

lint:
	grunt quality

install:
	npm install
