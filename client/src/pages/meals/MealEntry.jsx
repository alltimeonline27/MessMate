function MealEntry() {
  return (
    <div>
      <h1>Add Meal Entry</h1>

      <form>
        <label>
          Member
          <select>
            <option>Select Member</option>
          </select>
        </label>

        <br />
        <br />

        <label>
          Date
          <input type="date" />
        </label>

        <br />
        <br />

        <label>
          Meal Type
          <select>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
          </select>
        </label>

        <br />
        <br />

        <label>
          Quantity
          <input type="number" min="1" defaultValue="1" />
        </label>

        <br />
        <br />

        <button type="submit">Add Meal</button>
      </form>
    </div>
  );
}

export default MealEntry;