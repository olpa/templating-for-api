OPENAI_FILES := $(wildcard openai/lib/*.jsonnet) \
  $(wildcard openai/fixture/*.json)

SCHEMA_FILES := $(wildcard schemas/*.json)

ALL_FILES := $(OPENAI_FILES) $(SCHEMA_FILES)
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
