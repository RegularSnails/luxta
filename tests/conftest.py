# main/tests/conftest.py
import pathlib
import importlib.util
import pytest

# main/ is the parent of this tests/ folder
ROOT = pathlib.Path(__file__).resolve().parent.parent
APP_FILE = ROOT / "app.py"  # this must exist in main/

# Load main/app.py as a module without PYTHONPATH/package imports
spec = importlib.util.spec_from_file_location("local_app", APP_FILE)
local_app = importlib.util.module_from_spec(spec)
assert spec and spec.loader, "Could not load app.py via importlib"
spec.loader.exec_module(local_app)

@pytest.fixture(scope="session")
def appmod():
    """The loaded main/app.py module."""
    return local_app

@pytest.fixture
def client(appmod):
    appmod.app.config["TESTING"] = True
    return appmod.app.test_client()

