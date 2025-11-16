#!/bin/sh

#
# PROJECT[sh-realpath]
# License: https://github.com/mkropat/sh-realpath/blob/master/LICENSE.txt
#
realpath() {
    canonicalize_path "$(resolve_symlinks "$1")"
}

resolve_symlinks() {
    _resolve_symlinks "$1"
}

_resolve_symlinks() {
    _assert_no_path_cycles "$@" || return

    local dir_context path
    path=$(readlink -- "$1")
    if [ $? -eq 0 ]; then
        dir_context=$(dirname -- "$1")
        _resolve_symlinks "$(_prepend_dir_context_if_necessary "$dir_context" "$path")" "$@"
    else
        printf '%s\n' "$1"
    fi
}

_prepend_dir_context_if_necessary() {
    if [ "$1" = . ]; then
        printf '%s\n' "$2"
    else
        _prepend_path_if_relative "$1" "$2"
    fi
}

_prepend_path_if_relative() {
    case "$2" in
        /* ) printf '%s\n' "$2" ;;
         * ) printf '%s\n' "$1/$2" ;;
    esac
}

_assert_no_path_cycles() {
    local target path

    target=$1
    shift

    for path in "$@"; do
        if [ "$path" = "$target" ]; then
            return 1
        fi
    done
}

canonicalize_path() {
    if [ -d "$1" ]; then
        _canonicalize_dir_path "$1"
    else
        _canonicalize_file_path "$1"
    fi
}

_canonicalize_dir_path() {
    (cd "$1" 2>/dev/null && pwd -P)
}

_canonicalize_file_path() {
    local dir file
    dir=$(dirname -- "$1")
    file=$(basename -- "$1")
    (cd "$dir" 2>/dev/null && printf '%s/%s\n' "$(pwd -P)" "$file")
}

# Optionally, you may also want to include:

### readlink emulation ###

readlink() {
    if _has_command readlink; then
        _system_readlink "$@"
    else
        _emulated_readlink "$@"
    fi
}

_has_command() {
    hash -- "$1" 2>/dev/null
}

_system_readlink() {
    command readlink "$@"
}

_emulated_readlink() {
    if [ "$1" = -- ]; then
        shift
    fi

    _gnu_stat_readlink "$@" || _bsd_stat_readlink "$@"
}

_gnu_stat_readlink() {
    local output
    output=$(stat -c %N -- "$1" 2>/dev/null) &&

    printf '%s\n' "$output" |
        sed "s/^‘[^’]*’ -> ‘\(.*\)’/\1/
             s/^'[^']*' -> '\(.*\)'/\1/"
    # FIXME: handle newlines
}

_bsd_stat_readlink() {
    stat -f %Y -- "$1" 2>/dev/null
}

release_usage()
{
	echo "Usage: $0 [ -v release version ] [ -i commit_id, support null ] [ -m release messgae, support null ]" 1>&2
	exit 1
}

COMMIT_BY_SPEC_SHA=
COMMIT_BY_SHORT_SHA=
COMMIT_BY_BRANCH=
COMMIT_BY_VERSION=
COMMIT_TAG_MESSAGE=
COMMIT_TAG_NAME=

# 参数解析
while getopts ":-p:-i:-v:-m:" o; do
	case "${o}" in
		i)
			COMMIT_BY_SPEC_SHA=${OPTARG}
			;;
		v)
			COMMIT_BY_VERSION=${OPTARG}
			;;
		m)
			COMMIT_TAG_MESSAGE=${OPTARG}
			;;
		*)
			echo "ERROR"
			release_usage
			;;
	esac
done
shift $((OPTIND-1))

# 参数为空判断
if [ -z "${COMMIT_BY_VERSION}" ]; then
	echo "ERR: please input 'version' param.."
	release_usage
fi


git status &> /dev/null
is_git_repo=$?

if [ "${is_git_repo}" = "0" ]; then
	git config core.abbrev 8

	current_branch=`git rev-parse --abbrev-ref HEAD`
	case "${current_branch}" in
		"dev"):
			COMMIT_BY_BRANCH=dev
			;;
		"test"):
			COMMIT_BY_BRANCH=test
			;;
		"master"):
			COMMIT_BY_BRANCH=prod
			;;
		*)
			release_usage
			;;
	esac

	if [ -z "${COMMIT_BY_SPEC_SHA}" ]; then
		COMMIT_BY_SHORT_SHA=`git rev-parse --short HEAD`
	else
		git show --shortstat --pretty=oneline ${COMMIT_BY_SPEC_SHA} &> /dev/null
		is_git_commit_id=$?
		if [ "${is_git_commit_id}" = "0" ]; then
			COMMIT_BY_SHORT_SHA=${COMMIT_BY_SPEC_SHA:0:8}
		else
			COMMIT_BY_SHORT_SHA=`git rev-parse --short HEAD`
		fi
	fi

	COMMIT_TAG_NAME="${COMMIT_BY_BRANCH}-${COMMIT_BY_VERSION}-${COMMIT_BY_SHORT_SHA}"

	if [ -z "${COMMIT_TAG_MESSAGE}" ]; then
		COMMIT_TAG_MESSAGE="[PROJECT RELEASE]: ENV='${COMMIT_BY_BRANCH}' VERSION='${COMMIT_BY_VERSION}' COMMIT_SHORT_ID='${COMMIT_BY_SHORT_SHA}' TAG='${COMMIT_TAG_NAME}'"
	fi

	if [ -z "${COMMIT_BY_SPEC_SHA}" ]; then
		git tag -f -m "${COMMIT_TAG_MESSAGE}" -a "${COMMIT_TAG_NAME}"
		echo "PROJECT Git Repo Tag success: ${COMMIT_TAG_NAME}, ${COMMIT_TAG_MESSAGE}"
		git push origin refs/tags/${COMMIT_TAG_NAME} --verbose &> /dev/null
		is_push_tag_success=$?
		if [ "${is_push_tag_success}" = "0" ]; then
			echo "PROJECT Git Repo Tag push success: [new tag] refs/tags/${COMMIT_TAG_NAME}"
		fi
	else
		git tag -f -m "${COMMIT_TAG_MESSAGE}" -a "${COMMIT_TAG_NAME}" ${COMMIT_BY_SHORT_SHA}
		echo "PROJECT Git Repo Tag success: ${COMMIT_TAG_NAME}, ${COMMIT_TAG_MESSAGE}"
		git push origin refs/tags/${COMMIT_TAG_NAME} --verbose &> /dev/null
		is_push_tag_success=$?
		if [ "${is_push_tag_success}" = "0" ]; then
			echo "PROJECT Git Repo Tag push success: [new tag] refs/tags/${COMMIT_TAG_NAME}"
		fi

	fi
else
	echo "ERR: is not a real git repo.."
	exit 1
fi

exit 0
