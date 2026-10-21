
from inventory.inventory_manager import InventoryManager


def main():
    inventory = InventoryManager()

    # 1. Check dataset loading
    records = inventory.get_all_records()
    assert len(records) > 0, "Dataset should not be empty"
    assert "record_id" in records.columns
    assert "Risk_Category" in records.columns
    print("PASS: Dataset loaded successfully")

    # 2. Check record lookup
    record = inventory.get_record("REC-00001")
    assert record is not None, "First record should exist"
    assert record["Risk_Category"] in ["Low", "Medium", "High"]
    assert inventory.get_record("INVALID-ID") is None
    print("PASS: Record lookup works")

    # 3. Check search
    results = inventory.search_records("REC-00001")
    assert not results.empty
    assert results.iloc[0]["record_id"] == "REC-00001"
    print("PASS: Record search works")

    # 4. Check all risk categories
    for category, decision in [
        ("Low", 0),
        ("Medium", 1),
        ("High", 2),
    ]:
        filtered = inventory.filter_by_decision(category)
        assert not filtered.empty, f"No records found for {category}"
        assert (filtered["Decision"] == decision).all()
        assert (filtered["Risk_Category"] == category).all()
        print(f"PASS: {category} risk filter works")

    # 5. Check summary
    summary = inventory.get_summary()
    assert summary["total_records"] == len(records)
    print("PASS: Inventory summary works")

    print("\nAll inventory tests passed!")


if __name__ == "__main__":
    main()
