TOPDIR=$(shell pwd)

all: gendb
	@echo "ALL DONE"

gendb:
	@echo "start gen db model...."$(TOPDIR)
	@cd $(TOPDIR)/adaptor/repo && gentool -c gen.yaml