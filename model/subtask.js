// MODEL CLASS AND CONSTRUCTOR FOR CREATING A SUBTASK OBJECT
class Subtask {
  constructor(title, minutes, isCompleted) {
    if (title.length < 500) {
      this.title = title;
    } else
      throw new Error(
        "Subtask title can't be over 500 characters long, because of the limitations of the database."
      );
    if (minutes > 0) {
      this.minutes = minutes;
    } else
      throw new Error(
        "Subtask minutes can't be negative, because the application databse wouldn't allow it."
      );
    if (
      isCompleted === 0 ||
      isCompleted === 1 ||
      isCompleted === true ||
      isCompleted === false
    ) {
      this.isCompleted = isCompleted;
    } else
      throw new Error(
        "Subtask isCompleted value must be a boolean (true or false)."
      );
  }
}

module.exports = Subtask;
