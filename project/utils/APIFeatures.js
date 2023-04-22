class APIFeatures {
  constructor(queryOfMongoDB, queryOfExpress) {
    this.queryOfMongoDB = queryOfMongoDB;
    this.queryOfExpress = queryOfExpress;
  }

  filter() {
    //Why I use these methods because of this
    //url is = 127.0.0.1:57850/api/v1/tours/?difficulty=easy&limit=1&sort=2&page=8&price[gte]=500
    //And the query of url is and in here when we add [gte] it makes it look like down
    // {
    //   difficulty: 'easy',
    //   limit: '1',
    //   sort: '2',
    //   page: '8',
    //   price: { gte: '500' }
    // }
    //1A) Building Query
    //Making shallow copy of queryExpress with object destruction
    //and then using the fields which user want to displayed because
    //ExcludedFields are the fields which used for making the results look which we want and
    // the fields deleted are used in methods of class which will called
    const queryObj = { ...this.queryOfExpress };
    const excludedFields = ['page', 'sort', 'limit', 'field'];
    excludedFields.forEach((el) => delete queryObj[el]);

    //1B )Advanced Filtering
    //I use queryObj to convert it into string and then convert it in mongodb query match for having
    //$ operator near the gte|lte|gt|lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|lte|gt|lt)\b/g, (match) => `$${match}`);

    //Sending Query
    this.queryOfMongoDB.find(JSON.parse(queryStr));
    // query = Tour.find(JSON.parse(queryStr));

    //Return Entire object to chain the methods
    return this;
  }

  sort() {
    if (this.queryOfExpress.sort) {
      const sortBy = this.queryOfExpress.sort.split(',').join(' ');
      this.queryOfMongoDB = this.queryOfMongoDB.sort(sortBy);
    } else {
      this.queryOfMongoDB = this.queryOfMongoDB.sort('-ratingsAverage');
    }

    //Return Entire object to chain the methods
    return this;
  }

  limitFields() {
    //3) Field limiting
    if (this.queryOfExpress.fields) {
      const fieldsWanted = this.queryOfExpress.fields.split(',').join(' ');
      this.queryOfMongoDB = this.queryOfMongoDB.select(fieldsWanted);
    } else {
      this.queryOfMongoDB = this.queryOfMongoDB.select('-__v');
    }

    //Return Entire object to chain the methods
    return this;
  }

  pagination() {
    //4) Pagination
    const limit = this.queryOfExpress.limit * 1 || 2;
    const page = this.queryOfExpress.page * 1 || 1;
    const skip = (page - 1) * limit;
    this.queryOfMongoDB = this.queryOfMongoDB.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;