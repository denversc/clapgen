#!/bin/bash

set -euo pipefail

function parse_args {
  local a_mode=notfound
  local a_value=
  local b_mode=notfound
  local b_value=

  while [[ $# -gt 0 ]] ; do
    local arg="$1"
    shift

    if [[ $arg == -* ]] ; then
      if [[ $a_mode == "needvalue" ]] ; then
        echo "ERROR: expected value after -a, but got $arg" >&2
        exit 2
      elif [[ $b_mode == "needvalue" ]] ; then
        echo "ERROR: expected value after -b, but got $arg" >&2
        exit 2
      elif [[ $arg == "-a" ]] ; then
        a_mode=needvalue
      elif [[ $arg == "-b" ]] ; then
        b_mode=needvalue
      else
        echo "ERROR: unknown option: $arg" >&2
        exit 2
      fi
    elif [[ $a_mode == "needvalue" ]] ; then
      a_value="$arg"
      a_mode=found
    elif [[ $b_mode == "needvalue" ]] ; then
      b_value="$arg"
      b_mode=found
    else
      echo "ERROR: unrecognized command-line argument: $arg" >&2
      exit 2
    fi
  done

  if [[ $a_mode == "needvalue" ]] ; then
    echo "ERROR: missing value after -a" >&2
    exit 2
  else
    readonly A="$a_value"
    readonly ARG_A_RESULT="$a_mode"
  fi

  if [[ $b_mode == "needvalue" ]] ; then
    echo "ERROR: missing value after -b" >&2
    exit 2
  else
    readonly B="$b_value"
    readonly ARG_B_RESULT="$b_mode"
  fi
}

parse_args "$@"

echo "A=$A"
echo "ARG_A_RESULT=$ARG_A_RESULT"
echo "B=$B"
echo "ARG_B_RESULT=$ARG_B_RESULT"
