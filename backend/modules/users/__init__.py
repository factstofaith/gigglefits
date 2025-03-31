# Users module for the TAP Integration Platform

from fastapi import APIRouter
from modules.users.controller import router

# Re-export the router
__all__ = ["router"]
