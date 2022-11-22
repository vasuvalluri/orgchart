import React from "react";
import { Select } from "antd";
import { config } from "../Config";
const { Option } = Select;

const BASE_URL = config.BASE_URL;
const GETNAMES = "/getNames";

let timeout;
let currentValue;

function fetchUserList(value, callback) {
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;

  function fake() {
    if (value.length > 2) {
      const url = `${BASE_URL}${GETNAMES}/${value}`;
      fetch(url)
        .then((response) => response.json())
        .then((d) => {
          if (currentValue === value) {
            const result = d;
            const data = [];
            result.forEach((r) => {
              data.push({
                branch: `${r.branch};${r.name}`,
                name: r.name,
              });
            });
            callback(data);
          }
        });
    }
  }

  timeout = setTimeout(fake, 300);
}

/*async function fetchUserList(empname) {
  console.log("fetching list", empname);
  if (empname.length > 2) {
    const url = `${BASE_URL}${GETNAMES}/${empname}`;
    return fetch(url)
      .then((response) => response.json())
      .then((body) =>
        body.results.map((user) => ({
          label: `${user.name}`,
          value: user.branch,
        }))
      );
  }
}*/

class NamesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      data: [],
      value: undefined,
    };
  }
  handleSearch = (value) => {
    if (value) {
      fetchUserList(value, (data) => {
        this.setState({ data });
      });
    } else {
      this.setState({ data: [] });
    }
  };

  onNameChange = (value) => {
    this.setState({ value });
    this.props.onChange();
  };

  render() {
    const options = this.state.data.map((d) => (
      <Option key={d.branch}>{d.name}</Option>
    ));
    return (
      <Select
        showSearch
        allowClear={true}
        value={this.state.value}
        placeholder={this.props.placeholder}
        style={this.props.style}
        defaultActiveFirstOption={false}
        showArrow={false}
        filterOption={false}
        onSearch={this.handleSearch}
        onChange={this.props.onNameChange()}
        notFoundContent={null}
      >
        {options}
      </Select>
    );
  }
}

export default NamesList;
