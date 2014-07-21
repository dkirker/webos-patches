#!/bin/bash

SCRIPT=$1
INSTALLPATH=/media/cryptofs/apps/usr/palm/applications/de.omoco.paketverfolgung/services

echo "Installing $SCRIPT to $INSTALLPATH/$SCRIPT on device"

novacom put file://$INSTALLPATH/$SCRIPT < $SCRIPT

