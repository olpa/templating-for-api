LIB_FILES :=$(wildcard lib/*.jsonnet)

SCHEMA_FILES := $(wildcard schemas/*.json)

OPENAI_FILES := $(wildcard openai/lib/*.jsonnet) \
  $(wildcard openai/fixture/*.json)

ANTHROPIC_FILES := $(wildcard anthropic/lib/*.jsonnet) \
  $(wildcard anthropic/fixture/*.json)

COHERE_FILES := $(wildcard cohere/lib/*.jsonnet) \
  $(wildcard cohere/fixture/*.json)

GOOGLE_FILES := $(wildcard google/lib/*.jsonnet) \
  $(wildcard google/fixture/*.json)

DOC_FILES := README.md changelog.md

ALL_FILES := $(DOC_FILES) $(SCHEMA_FILES) $(LIB_FILES) $(OPENAI_FILES) $(ANTHROPIC_FILES) $(COHERE_FILES) $(GOOGLE_FILES)
ALL_DIST_FILES := $(addprefix dist/, $(ALL_FILES))

dist: $(ALL_DIST_FILES)

./dist/%: %
	mkdir -p $(dir $@)
	cp $< $@

# --

TEST_DIRS := $(dir $(wildcard */test))

TEST_TRIGGERS := $(addsuffix .test-trigger, $(TEST_DIRS))

test: $(TEST_TRIGGERS)

%.test-trigger:
	cd $(dir $@) && npm test

DEPS_TRIGGERS := $(addsuffix .deps-trigger, $(TEST_DIRS))

update-deps: $(DEPS_TRIGGERS)

%.deps-trigger:
	cd $(dir $@) && npm install tplfa-jsonnet --update
