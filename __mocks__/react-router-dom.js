export const useNavigate = jest.fn();
export const Link = ({ to, children, ...props }) => (
  <a href={to} {...props}>
    {children}
  </a>
);