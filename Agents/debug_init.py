import os
import sys

# Ensure current directory is in path
sys.path.append(os.getcwd())

print("[DEBUG] Starting Isolated Initialization Test...")

try:
    print("[DEBUG] Importing AppCompareState...")
    from src.state import AppCompareState
    print("[DEBUG] Success.")

    print("[DEBUG] Importing ComparisonNodes...")
    from persona.compare.nodes import ComparisonNodes
    print("[DEBUG] Success.")

    print("[DEBUG] Initializing ComparisonNodes...")
    nodes = ComparisonNodes()
    print("[DEBUG] Success.")

    print("[DEBUG] Importing PersonaCompareGraph...")
    from persona.compare.graph import PersonaCompareGraph
    print("[DEBUG] Success.")

    print("[DEBUG] Initializing PersonaCompareGraph...")
    graph = PersonaCompareGraph()
    print("[DEBUG] SUCCESS: Comparison Graph initialized without errors.")

except Exception as e:
    import traceback
    print(f"\n[DEBUG] !!! INITIALIZATION FAILED !!!")
    print(f"[DEBUG] Error Type: {type(e).__name__}")
    print(f"[DEBUG] Error Message: {str(e)}")
    print("\n[DEBUG] Full Traceback:")
    print(traceback.format_exc())
    sys.exit(1)
