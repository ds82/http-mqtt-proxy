.PHONY: docker

DOCKER_IMAGE = "$(shell basename $(CURDIR))"

docker:
	docker build -t $(DOCKER_IMAGE) .
