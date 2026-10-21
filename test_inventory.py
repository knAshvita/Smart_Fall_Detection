
from inventory.inventory_manager import InventoryManager


def main():
    inventory = InventoryManager()

    print("\n--- INVENTORY SUMMARY ---")
    print(inventory.get_summary())

    print("\n--- FIRST FIVE RECORDS ---")
    print(inventory.get_all_records().head().to_string(index=False))

    print("\n--- SEARCH TEST ---")
    record = inventory.get_record("REC-00001")
    print(record if record else "Record not found")

    print("\n--- DECISION FILTER TEST ---")
    decisions = inventory.get_summary()["unique_decisions"]

    if decisions:
        filtered = inventory.filter_by_decision(decisions[0])
        print(f"Decision {decisions[0]}: {len(filtered)} records")

    print("\nInventory module test completed.")


if __name__ == "__main__":
    main()
